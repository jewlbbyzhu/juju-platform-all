import request from '../request'
import type {
  PartyListParams,
  PartyListResponse,
  PartyDetail,
  PartyStatsData,
  PartyAuditRequest,
  ExportPartyRequest,
  PartyAuditHistory
} from '@/types/party'

export class PartyAPI {
  /**
   * Get pending parties for audit
   * @param params - Query parameters
   * @returns Paginated party list with pending status
   */
  static async getPendingParties(params: PartyListParams): Promise<PartyListResponse> {
    return request.get('/parties/pending', { params })
  }

  /**
   * Get party list with pagination, search, and filters
   * @param params - Query parameters
   * @returns Paginated party list
   */
  static async getParties(params: PartyListParams): Promise<PartyListResponse> {
    return request.get('/parties/', { params })
  }

  /**
   * Get party detail by ID
   * @param id - Party ID
   * @returns Party detail with participants and audit history
   */
  static async getPartyDetail(id: number): Promise<PartyDetail> {
    return request.get(`/parties/${id}`)
  }

  /**
   * Audit party (approve or reject)
   * @param id - Party ID
   * @param data - Audit data (status and reason)
   * @returns void
   */
  static async auditParty(
    id: number,
    data: PartyAuditRequest
  ): Promise<void> {
    return request.put(`/parties/${id}/audit`, data)
  }

  /**
   * Get party audit history
   * @param id - Party ID
   * @returns Audit history list
   */
  static async getPartyAuditHistory(id: number): Promise<PartyAuditHistory[]> {
    return request.get(`/parties/${id}/audit-history`)
  }

  /**
   * Get party statistics
   * @returns Party statistics data
   */
  static async getPartyStats(): Promise<PartyStatsData> {
    return request.get('/parties/stats')
  }

  /**
   * Export parties to Excel
   * @param params - Export parameters
   * @returns Blob data for download
   */
  static async exportParties(params: ExportPartyRequest): Promise<Blob> {
    return request.get('/parties/export', {
      params,
      responseType: 'blob'
    })
  }

  /**
   * Search parties by keyword
   * @param keyword - Search keyword
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Paginated party list
   */
  static async searchParties(
    keyword: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PartyListResponse> {
    return request.get('/parties/search', {
      params: { keyword, page, pageSize }
    })
  }

  /**
   * Get party participants
   * @param id - Party ID
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Party participant list
   */
  static async getPartyParticipants(
    id: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    list: any[]
    total: number
    page: number
    pageSize: number
  }> {
    return request.get(`/parties/${id}/participants`, {
      params: { page, pageSize }
    })
  }

  /**
   * Batch audit parties
   * @param ids - Party IDs
   * @param data - Audit data
   * @returns void
   */
  static async batchAuditParties(
    ids: number[],
    data: PartyAuditRequest
  ): Promise<void> {
    return request.post('/parties/batch/audit', { ids, ...data })
  }

  /**
   * Cancel party
   * @param id - Party ID
   * @param reason - Cancel reason
   * @returns void
   */
  static async cancelParty(id: number, reason?: string): Promise<void> {
    return request.post(`/parties/${id}/cancel`, { reason })
  }

  /**
   * Complete party
   * @param id - Party ID
   * @returns void
   */
  static async completeParty(id: number): Promise<void> {
    return request.post(`/parties/${id}/complete`)
  }
}

// Export for backward compatibility
export const partyAPI = {
  getPendingParties: PartyAPI.getPendingParties,
  getParties: PartyAPI.getParties,
  getPartyDetail: PartyAPI.getPartyDetail,
  auditParty: PartyAPI.auditParty,
  getPartyAuditHistory: PartyAPI.getPartyAuditHistory,
  getPartyStats: PartyAPI.getPartyStats,
  exportParties: PartyAPI.exportParties,
  searchParties: PartyAPI.searchParties,
  getPartyParticipants: PartyAPI.getPartyParticipants,
  batchAuditParties: PartyAPI.batchAuditParties,
  cancelParty: PartyAPI.cancelParty,
  completeParty: PartyAPI.completeParty,
}

