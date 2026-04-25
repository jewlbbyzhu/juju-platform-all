import request from '../request'
import type {
  FinancialStats,
  FinancialStatsParams,
  Withdrawal,
  WithdrawalListParams,
  WithdrawalListResponse,
  WithdrawalAuditRequest,
  Transaction,
  TransactionListParams,
  TransactionListResponse,
  FinancialReportExportRequest
} from '@/types/finance'

export class FinanceAPI {
  /**
   * Get financial statistics
   * @param params - Query parameters (optional date range)
   * @returns Financial statistics including revenue, trends, and withdrawal data
   */
  static async getFinancialStats(params?: FinancialStatsParams): Promise<FinancialStats> {
    return request.get('/finance/stats', { params })
  }

  /**
   * Get withdrawal list with pagination and filters
   * @param params - Query parameters
   * @returns Paginated withdrawal list
   */
  static async getWithdrawals(params: WithdrawalListParams): Promise<WithdrawalListResponse> {
    return request.get('/finance/withdrawals', { params })
  }

  /**
   * Get withdrawal detail by ID
   * @param id - Withdrawal ID
   * @returns Withdrawal detail with user and bank card info
   */
  static async getWithdrawalDetail(id: number): Promise<Withdrawal> {
    return request.get(`/finance/withdrawals/${id}`)
  }

  /**
   * Audit withdrawal request (approve or reject)
   * @param id - Withdrawal ID
   * @param data - Audit data (status, reason, reviewer)
   * @returns void
   */
  static async auditWithdrawal(
    id: number,
    data: WithdrawalAuditRequest
  ): Promise<void> {
    return request.post(`/finance/withdrawals/${id}/audit`, data)
  }

  /**
   * Get pending withdrawals count
   * @returns Number of pending withdrawals
   */
  static async getPendingWithdrawalsCount(): Promise<number> {
    return request.get('/finance/withdrawals/pending/count')
  }

  /**
   * Get transaction list with pagination and filters
   * @param params - Query parameters
   * @returns Paginated transaction list
   */
  static async getTransactions(params: TransactionListParams): Promise<TransactionListResponse> {
    return request.get('/finance/transactions', { params })
  }

  /**
   * Get transaction detail by ID
   * @param id - Transaction ID
   * @returns Transaction detail
   */
  static async getTransactionDetail(id: number): Promise<Transaction> {
    return request.get(`/finance/transactions/${id}`)
  }

  /**
   * Export financial report to Excel
   * @param params - Export parameters
   * @returns Blob data for download
   */
  static async exportFinancialReport(params: FinancialReportExportRequest): Promise<Blob> {
    return request.post('/finance/report/export', params, {
      responseType: 'blob'
    })
  }

  /**
   * Get user transactions
   * @param userId - User ID
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Paginated transaction list
   * @todo 后端需要实现 GET /users/:id/transactions 接口
   */
  static async getUserTransactions(
    userId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TransactionListResponse> {
    // TODO: 后端接口未实现，暂时使用 finance/transactions 并过滤
    console.warn('getUserTransactions: 后端接口 GET /users/:id/transactions 未实现')
    return request.get('/finance/transactions', {
      params: { userId, page, pageSize }
    })
  }

  /**
   * Get revenue statistics by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Financial statistics for the specified period
   */
  static async getRevenueByDateRange(
    startDate: string,
    endDate: string
  ): Promise<FinancialStats> {
    return request.get('/analytics/revenue', {
      params: { startDate, endDate }
    })
  }

  /**
   * Batch audit withdrawals
   * @param ids - Withdrawal IDs
   * @param data - Audit data
   * @returns void
   */
  static async batchAuditWithdrawals(
    ids: number[],
    data: WithdrawalAuditRequest
  ): Promise<void> {
    return request.post('/finance/withdrawals/batch/audit', {
      ids,
      ...data
    })
  }

  /**
   * Get withdrawal statistics
   * @returns Withdrawal statistics
   */
  static async getWithdrawalStats(): Promise<{
    pending: number
    processed: number
    rejected: number
    totalAmount: number
    pendingAmount: number
  }> {
    return request.get('/finance/stats')
  }
}

// Export for backward compatibility
export const financeAPI = {
  getFinancialStats: FinanceAPI.getFinancialStats,
  getWithdrawals: FinanceAPI.getWithdrawals,
  getWithdrawalDetail: FinanceAPI.getWithdrawalDetail,
  auditWithdrawal: FinanceAPI.auditWithdrawal,
  getPendingWithdrawalsCount: FinanceAPI.getPendingWithdrawalsCount,
  getTransactions: FinanceAPI.getTransactions,
  getTransactionDetail: FinanceAPI.getTransactionDetail,
  exportFinancialReport: FinanceAPI.exportFinancialReport,
  getUserTransactions: FinanceAPI.getUserTransactions,
  getRevenueByDateRange: FinanceAPI.getRevenueByDateRange,
  batchAuditWithdrawals: FinanceAPI.batchAuditWithdrawals,
  getWithdrawalStats: FinanceAPI.getWithdrawalStats,
}
