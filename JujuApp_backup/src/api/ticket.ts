import api from './index';
import { ApiResponse, PageResponse } from '../types/api';

export interface Ticket {
  id: number;
  user_id: number;
  order_id: number;
  party_id: number;
  ticket_type_id: number;
  ticket_no: string;
  qr_code: string;
  status: 'valid' | 'used' | 'expired';
  used_at?: string;
  created_at: string;
  party?: {
    id: number;
    title: string;
    cover_image: string;
    start_time: string;
    address: string;
  };
  ticket_type?: {
    id: number;
    name: string;
    price: number;
  };
  name?: string;
  phone?: string;
}

export const ticketApi = {
  getTickets: (params: { page?: number; pageSize?: number; status?: string } = {}) => api.get<ApiResponse<PageResponse<Ticket>>>('/tickets', { params }),
  getTicketDetail: (id: number | string) => api.get<ApiResponse<Ticket>>(`/tickets/${id}`),
  getTicketByNo: (ticketNo: string) => api.get<ApiResponse<Ticket>>(`/tickets/number/${ticketNo}`),
  useTicket: (id: number | string) => api.post<ApiResponse<Ticket>>(`/tickets/${id}/use`),
  transferTicket: (id: number | string, toUserId: number) => api.post<ApiResponse<Ticket>>(`/tickets/${id}/transfer`, { to_user_id: toUserId }),
  validateTicket: (ticketNo: string) => api.post<ApiResponse<{ valid: boolean; ticket?: Ticket; message?: string }>>('/tickets/validate', { ticket_no: ticketNo }),
  getTicketStats: () => api.get<ApiResponse<{ total: number; used: number; valid: number; expired: number }>>('/tickets/stats'),
  getTicketQrCode: (id: number | string) => api.get<ApiResponse<{ qrCode: string; url: string }>>(`/tickets/${id}/qrcode`),
  shareTicket: (id: number | string) => api.post<ApiResponse<{ shareUrl: string; shareCode: string }>>(`/tickets/${id}/share`),
};

export default ticketApi;
