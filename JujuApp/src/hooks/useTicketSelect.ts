import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { gradients } from '../theme';
import { partyApi, TicketType as ApiTicketType } from '../api/party';
import { orderApi } from '../api/order';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  remaining: number;
  isVip?: boolean;
  gradient: [string, string];
}

export interface PartyData {
  id: string;
  title: string;
  coverImage?: string;
  startTime: string;
  location?: {
    name: string;
  };
}

interface UseTicketSelectOptions {
  partyId?: string;
  onSubmitSuccess?: (orderInfo: {
    ticketName: string;
    quantity: number;
  }) => void;
}

interface UseTicketSelectReturn {
  tickets: TicketType[];
  party: PartyData | null;
  selectedTicket: string;
  quantity: number;
  contactName: string;
  contactPhone: string;
  loading: boolean;
  submitting: boolean;
  selectedTicketData: TicketType | undefined;
  totalPrice: number;
  maxQuantity: number;
  handleTicketSelect: (ticketId: string) => void;
  handleQuantityChange: (delta: number) => void;
  handleNameChange: (value: string) => void;
  handlePhoneChange: (value: string) => void;
  handleSubmit: () => Promise<void>;
}

const GRADIENT_MAP: Record<string, [string, string]> = {
  early: gradients.cool,
  regular: gradients.warm,
  vip: gradients.vip,
};

const DEFAULT_FEATURES: Record<string, string[]> = {
  early: ['入场资格', '基础饮品', '活动资料'],
  regular: ['入场资格', '无限畅饮', '专属座位', '纪念品'],
  vip: ['优先入场', 'VIP专区', '专属服务', '精美礼品', '与嘉宾互动'],
};

function mapApiTicketToTicketType(apiTicket: ApiTicketType): TicketType {
  const typeKey = apiTicket.type === 1 ? 'early' : apiTicket.type === 3 ? 'vip' : 'regular';
  return {
    id: String(apiTicket.id),
    name: apiTicket.name,
    price: apiTicket.price,
    originalPrice: apiTicket.original_price > apiTicket.price ? apiTicket.original_price : undefined,
    description: apiTicket.description || `${apiTicket.name} - 标准入场票`,
    features: DEFAULT_FEATURES[typeKey] || DEFAULT_FEATURES.regular,
    remaining: apiTicket.current_stock ?? apiTicket.available_count ?? 0,
    isVip: apiTicket.type === 3 || apiTicket.vip_level !== undefined,
    gradient: GRADIENT_MAP[typeKey] || gradients.warm,
  };
}

export function useTicketSelect(
  options: UseTicketSelectOptions = {},
): UseTicketSelectReturn {
  const { partyId, onSubmitSuccess } = options;

  const [party, setParty] = useState<PartyData | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (partyId) {
      loadPartyAndTickets();
    }
  }, [partyId]);

  const loadPartyAndTickets = useCallback(async () => {
    if (!partyId) return;
    setLoading(true);
    try {
      const res = await partyApi.getPartyDetail(partyId);
      const resData = res as unknown as { code: number; data: { id: number; title: string; cover_image?: string; start_time: string; address?: string; city?: string; ticket_types?: ApiTicketType[] } };

      if (resData.code === 0 && resData.data) {
        const data = resData.data;
        setParty({
          id: String(data.id),
          title: data.title,
          coverImage: data.cover_image,
          startTime: data.start_time,
          location: { name: data.address || data.city || '地点待定' },
        });

        if (data.ticket_types && data.ticket_types.length > 0) {
          setTickets(data.ticket_types.map(mapApiTicketToTicketType));
        }
      }
    } catch (err) {
      console.warn('加载聚会详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  const selectedTicketData = useMemo(
    () => tickets.find(t => t.id === selectedTicket),
    [tickets, selectedTicket],
  );

  const totalPrice = useMemo(
    () => (selectedTicketData?.price || 0) * quantity,
    [selectedTicketData?.price, quantity],
  );

  const maxQuantity = useMemo(
    () => Math.min(selectedTicketData?.remaining || 1, 10),
    [selectedTicketData?.remaining],
  );

  const handleTicketSelect = useCallback((ticketId: string) => {
    setSelectedTicket(ticketId);
    setQuantity(1);
  }, []);

  const handleQuantityChange = useCallback(
    (delta: number) => {
      setQuantity(prev => {
        const newQty = prev + delta;
        if (newQty >= 1 && newQty <= maxQuantity) {
          return newQty;
        }
        return prev;
      });
    },
    [maxQuantity],
  );

  const handleNameChange = useCallback((value: string) => {
    setContactName(value);
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setContactPhone(value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedTicket) {
      Alert.alert('提示', '请选择票种');
      return;
    }
    if (!contactName.trim()) {
      Alert.alert('提示', '请输入联系人姓名');
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert('提示', '请输入联系电话');
      return;
    }
    if (!partyId) {
      Alert.alert('提示', '聚会信息缺失');
      return;
    }

    setSubmitting(true);
    try {
      const res = await orderApi.createOrder({
        party_id: Number(partyId),
        ticket_id: Number(selectedTicket),
        name: contactName.trim(),
        phone: contactPhone.trim(),
        gender: 0,
        quantity,
      }) as unknown as { code: number; data?: { id: number; order_no: string }; message?: string };

      if (res.code === 0 && res.data) {
        Alert.alert(
          '订单提交成功',
          `订单号: ${res.data.order_no}\n${selectedTicketData?.name || ''} × ${quantity}`,
          [
            {
              text: '去支付',
              onPress: () =>
                onSubmitSuccess?.({
                  ticketName: selectedTicketData?.name || '',
                  quantity,
                }),
            },
          ],
        );
      } else {
        Alert.alert('订单提交失败', res.message || '请稍后重试');
      }
    } catch (err) {
      Alert.alert('错误', '网络错误，请检查网络连接');
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedTicket,
    contactName,
    contactPhone,
    partyId,
    quantity,
    selectedTicketData,
    onSubmitSuccess,
  ]);

  return {
    tickets,
    party,
    selectedTicket,
    quantity,
    contactName,
    contactPhone,
    loading,
    submitting,
    selectedTicketData,
    totalPrice,
    maxQuantity,
    handleTicketSelect,
    handleQuantityChange,
    handleNameChange,
    handlePhoneChange,
    handleSubmit,
  };
}
