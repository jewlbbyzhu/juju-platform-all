import api from './index';
import { ApiResponse, PageResponse } from '../types/api';

export interface Party {
  id: number;
  title: string;
  description: string;
  category: string;
  theme: string;
  start_time: string;
  end_time: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  max_participants: number;
  gender_limit: number | null;
  min_age: number | null;
  max_age: number | null;
  cover_image: string;
  images: string[];
  status: number;
  is_featured: boolean;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
  organizer?: {
    id: number;
    nickname: string;
    avatar: string;
  };
  ticket_types?: TicketType[];
  attendee_count?: number;
}

export interface TicketType {
  id: number;
  party_id: number;
  name: string;
  type: number;
  price: number;
  original_price: number;
  available_count: number;
  max_per_user: number;
  early_bird_deadline: string | null;
  description: string;
  status: number;
  group_min?: number;
  group_discount?: number;
  bundle_count?: number;
  bundle_price?: number;
  vip_level?: number;
  vip_benefits?: string;
  current_stock?: number;
  sold_count?: number;
}

export interface CreatePartyParams {
  title: string;
  category: string;
  theme: string;
  description: string;
  start_time: string;
  end_time: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  max_participants: number;
  gender_limit?: number;
  min_age?: number;
  max_age?: number;
  ticket_types: {
    name: string;
    type: number;
    price: number;
    original_price?: number;
    available_count: number;
    max_per_user?: number;
    early_bird_deadline?: string;
    description?: string;
    status?: number;
  }[];
  images: string[];
  is_featured?: boolean;
  requires_approval?: boolean;
}

export interface PartyParams {
  page?: number;
  pageSize?: number;
  category?: string;
  location?: string;
  status?: number;
  keyword?: string;
}

export const partyApi = {
  getParties: (params: PartyParams = {}) => api.get<PageResponse<Party>>('/parties', { params }),
  getPartyDetail: (id: number | string) => api.get<ApiResponse<Party>>(`/parties/${id}`),
  createParty: (data: CreatePartyParams) => api.post<ApiResponse<Party>>('/parties', data),
  updateParty: (id: number | string, data: Partial<CreatePartyParams>) => api.put<ApiResponse<Party>>(`/parties/${id}`, data),
  deleteParty: (id: number | string) => api.delete<ApiResponse<void>>(`/parties/${id}`),
  getMyParties: (params: PartyParams = {}) => api.get<PageResponse<Party>>('/parties/my', { params }),
  getParticipatedParties: (params: PartyParams = {}) => api.get<PageResponse<Party>>('/parties/participated', { params }),
  getTicketInventory: (params: { partyId?: number; ticketTypeId?: number } = {}) => api.get<ApiResponse<unknown>>('/parties/tickets/inventory', { params }),
  updateTicketStatus: (ticketId: string | number, data: { status: number; reason?: string }) => api.put<ApiResponse<unknown>>(`/parties/tickets/${ticketId}/status`, data),
  submitReview: (data: { partyId: number; rating: number; content: string; tags?: string[] }) => api.post<ApiResponse<unknown>>('/parties/reviews', data),
  searchParties: (keyword: string, params: PartyParams = {}) => api.get<PageResponse<Party>>('/parties/search', { params: { ...params, keyword } }),
  getFeaturedParties: () => api.get<ApiResponse<Party[]>>('/parties/featured'),
  getCategories: () => api.get<ApiResponse<string[]>>('/parties/categories'),
  getThemes: () => api.get<ApiResponse<string[]>>('/parties/themes'),
  uploadImage: (filePath: string) => {
    // 创建 FormData 用于文件上传
    const formData = new FormData();
    formData.append('file', {
      uri: filePath,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as unknown as Blob);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default partyApi;
