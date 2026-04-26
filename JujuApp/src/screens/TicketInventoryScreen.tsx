import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  TextInput,
  RefreshControl,

  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { partyApi } from '../api/party';
import {
  useTheme,
  colors as themeColors,
  spacing,
  gradients,
  BorderRadius,
  Border,

  typography,
  textStyles,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { SkeletonCard } from '../components/Skeleton';


interface Ticket {
  id: string;
  name: string;
  type: number;
  price: number;
  original_price?: number;
  current_stock: number;
  old_count: number;
  status: number;
  party_name?: string;
  group_min?: number;
  group_discount?: number;
}

const statusTextMap: Record<number, string> = {
  0: '在售',
  1: '售罄',
  2: '停售',
};

const statusColorMap: Record<number, string> = {
  0: themeColors.status.success,
  1: themeColors.status.error,
  2: themeColors.text.tertiary,
};

const typeMap: Record<number, string> = {
  1: '普通',
  2: '早鸟',
  3: '男性',
  4: '女性',
  5: '男性早鸟',
  6: '女性早鸟',
  7: 'VIP专享',
  8: '团购票',
  9: '套票',
};

export default function TicketInventoryScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');

  const loadTickets = useCallback(
    async (reset = false) => {
      if (reset) {
        setPage(1);
        setTickets([]);
        setHasMore(true);
      }
      if (loading || (!hasMore && !reset)) return;
      const currentPage = reset ? 1 : page;
      setLoading(true);
      try {
        const res = await partyApi.getTicketInventory({});
        if ((res as any).code === 0) {
          const newTickets = (res as any).data?.list || [];
          if (reset) setTickets(newTickets);
          else setTickets(prev => [...prev, ...newTickets]);
          setHasMore(newTickets.length >= 20);
          setPage(currentPage + 1);
        }
      } catch {
        Alert.alert('错误', '加载失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [loading, hasMore, page],
  );

  useEffect(() => {
    loadTickets(true);
  }, [loadTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets(true);
  };

  const getTicketTypeText = (type: number) => typeMap[type] || '普通';
  const getStatusText = (status: number) => statusTextMap[status] || '未知';
  const getStatusColor = (status: number) =>
    statusColorMap[status] || colors.text.tertiary;

  const filteredTickets = tickets.filter(
    item =>
      !searchKeyword ||
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const toggleStatus = async (item: Ticket) => {
    const newStatus = item.status === 0 ? 2 : 0;
    Alert.alert(
      '确认状态变更',
      `确定要将"${item.name}"设为${newStatus === 0 ? '在售' : '停售'}吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async () => {
            try {
              const res = await partyApi.updateTicketStatus(item.id, {
                status: newStatus,
              });
              if ((res as any).code === 0) {
                setTickets(prev =>
                  prev.map(t =>
                    t.id === item.id ? { ...t, status: newStatus } : t,
                  ),
                );
                Alert.alert('成功', '状态更新成功');
              } else {
                Alert.alert('错误', (res as any).message || '更新失败');
              }
            } catch {
              Alert.alert('错误', '网络错误');
            }
          },
        },
      ],
    );
  };

  // ===== 设计系统样式 =====
  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [colors.background.secondary],
  );

  const headerGradientStyle = useMemo(
    (): ViewStyle => ({
      paddingTop: 60,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    }),
    [],
  );

  const headerContentStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
    }),
    [],
  );

  const headerTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h1,
      color: colors.text.inverse,
      marginBottom: spacing.sm,
    }),
    [colors.text.inverse],
  );

  const headerSubtitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.inverse + 'E6',
    }),
    [colors.text.inverse],
  );

  const searchContainerStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      marginTop: -spacing.md,
    }),
    [],
  );

  const searchCardStyle = useMemo(
    (): ViewStyle => ({
      marginVertical: 0,
    }),
    [],
  );

  const filterBarStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    }),
    [],
  );

  const searchInputStyle = useMemo(
    (): TextStyle => ({
      flex: 1,
      height: 44,
      backgroundColor: colors.background.tertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: spacing.lg,
      fontSize: typography.size.body,
      color: colors.text.primary,
    }),
    [colors.background.tertiary, colors.text.primary],
  );

  const searchBtnStyle = useMemo(
    (): ViewStyle => ({
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
    }),
    [],
  );

  const searchBtnGradientStyle = useMemo(
    (): ViewStyle => ({
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [],
  );

  const searchBtnTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: 18,
    }),
    [],
  );

  const listContentStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
      paddingBottom: 100,
    }),
    [],
  );

  const skeletonContainerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const ticketCardStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.md,
    }),
    [],
  );

  const itemHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.lg,
    }),
    [],
  );

  const itemInfoStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      gap: spacing.xs,
    }),
    [],
  );

  const itemNameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h4,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    }),
    [colors.text.primary],
  );

  const typeBadgeStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.secondary.main + '26',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.sm,
      alignSelf: 'flex-start',
    }),
    [colors.secondary.main],
  );

  const itemTypeStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.secondary.main,
      fontWeight: typography.weight.medium,
    }),
    [colors.secondary.main],
  );

  const statusBadgeStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.md,
      gap: spacing.xs,
    }),
    [],
  );

  const statusDotStyle = useMemo(
    (): ViewStyle => ({
      width: 6,
      height: 6,
      borderRadius: BorderRadius.full,
    }),
    [],
  );

  const statusBadgeTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      fontWeight: typography.weight.semibold,
    }),
    [],
  );

  const itemDetailsStyle = useMemo(
    (): ViewStyle => ({
      gap: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: Border.width.thin,
      borderTopColor: colors.divider,
      marginBottom: spacing.lg,
    }),
    [colors.divider],
  );

  const detailRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }),
    [],
  );

  const detailLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const detailValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      color: colors.text.primary,
      fontWeight: typography.weight.medium,
    }),
    [colors.text.primary],
  );

  const highlightValueStyle = useMemo(
    (): TextStyle => ({
      color: colors.primary.main,
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
    }),
    [colors.primary.main],
  );

  const itemActionsStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      gap: spacing.md,
    }),
    [],
  );

  const actionBtnStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const emptyStateStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      paddingVertical: 80,
    }),
    [],
  );

  const emptyIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 64,
      marginBottom: spacing.lg,
    }),
    [],
  );

  const emptyTextStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    }),
    [colors.text.primary],
  );

  const emptySubtextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const footerLoaderStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
    }),
    [],
  );

  const actionBarStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.background.card,
      borderTopWidth: Border.width.normal,
      borderTopColor: colors.border,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    }),
    [colors.background.card, colors.border],
  );

  const barBtnStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <GlassCard style={ticketCardStyle} intensity="medium">
      <View style={itemHeaderStyle}>
        <View style={itemInfoStyle}>
          <Text style={itemNameStyle}>{item.name}</Text>
          <View style={typeBadgeStyle}>
            <Text style={itemTypeStyle}>{getTicketTypeText(item.type)}</Text>
          </View>
        </View>
        <LinearGradient
          colors={[
            `${getStatusColor(item.status)}20`,
            `${getStatusColor(item.status)}10`,
          ]}
          style={statusBadgeStyle}
        >
          <View
            style={[
              statusDotStyle,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text
            style={[
              statusBadgeTextStyle,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusText(item.status)}
          </Text>
        </LinearGradient>
      </View>

      <View style={itemDetailsStyle}>
        {[
          { label: '价格', value: `¥${item.price}`, highlight: true },
          { label: '可用库存', value: item.current_stock.toString() },
          { label: '已售数量', value: item.old_count.toString() },
        ].map((row, idx) => (
          <View key={idx} style={detailRowStyle}>
            <Text style={detailLabelStyle}>{row.label}</Text>
            <Text
              style={[
                detailValueStyle,
                row.highlight && highlightValueStyle,
              ]}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={itemActionsStyle}>
        <GlassButton
          title="编辑"
          onPress={() =>
            (navigation as any).navigate('TicketEdit', { ticketId: item.id })
          }
          variant="primary"
          size="small"
          style={actionBtnStyle}
        />
        <GlassButton
          title="调整库存"
          onPress={() =>
            (navigation as any).navigate('TicketStock', { ticketId: item.id })
          }
          variant="secondary"
          size="small"
          style={actionBtnStyle}
        />
        <GlassButton
          title={item.status === 1 ? '停售' : '在售'}
          onPress={() => toggleStatus(item)}
          variant={item.status === 0 ? 'ghost' : 'danger'}
          size="small"
          style={actionBtnStyle}
        />
      </View>
    </GlassCard>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={gradients.warm}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={headerGradientStyle}
    >
      <View style={headerContentStyle}>
        <Text style={headerTitleStyle}>票型库存管理</Text>
        <Text style={headerSubtitleStyle}>管理票型库存和销售情况</Text>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <View style={searchContainerStyle}>
      <GlassCard intensity="light" style={searchCardStyle}>
        <View style={filterBarStyle}>
          <TextInput
            style={searchInputStyle}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholder="搜索票型名称..."
            placeholderTextColor={colors.text.tertiary}
          />
          <Pressable style={searchBtnStyle} onPress={() => {}}>
            <LinearGradient
              colors={gradients.primary}
              style={searchBtnGradientStyle}
            >
              <Text style={searchBtnTextStyle}>🔍</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </GlassCard>
    </View>
  );

  if (initialLoading) {
    return (
      <View style={containerStyle}>
        {renderHeader()}
        <View style={skeletonContainerStyle}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {renderHeader()}
      {renderSearchBar()}

      <FlatList
        data={filteredTickets}
        renderItem={renderTicketItem}
        keyExtractor={item => item.id}
        contentContainerStyle={listContentStyle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => !loading && hasMore && loadTickets(false)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={emptyStateStyle}>
              <Text style={emptyIconStyle}>🎫</Text>
              <Text style={emptyTextStyle}>暂无票型</Text>
              <Text style={emptySubtextStyle}>点击下方按钮创建新票型</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <View style={footerLoaderStyle}>
              <SkeletonCard />
            </View>
          ) : null
        }
      />

      <View style={actionBarStyle}>
        <GlassButton
          title="+ 新建票型"
          onPress={() => (navigation as any).navigate('TicketCreate')}
          variant="gradient"
          size="medium"
          style={barBtnStyle}
        />
        <GlassButton
          title="批量调整"
          onPress={() => (navigation as any).navigate('TicketBatch')}
          variant="secondary"
          size="medium"
          style={barBtnStyle}
        />
      </View>
    </View>
  );
}
