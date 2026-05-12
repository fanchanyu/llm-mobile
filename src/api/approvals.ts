/**
 * Approvals API
 */
import api from './client';

export interface ApprovalItem {
  id: number;
  request_type: string;
  title: string;
  requester_name: string;
  requester_id: number;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export const approvalApi = {
  /** 取得待核准清單 */
  getPending: (empId: number) =>
    api.get<{ approvals: ApprovalItem[]; total: number }>(
      `/api/org/approvals/pending/${empId}`,
    ),

  /** 核准或駁回 */
  takeAction: (requestId: number, action: 'approve' | 'reject', comment?: string) =>
    api.post(`/api/org/approvals/${requestId}/action`, {
      action,
      comment: comment || '',
    }),
};
