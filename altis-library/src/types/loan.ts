
export const LOAN_STATUS = {
  BORROWED: 'BORROWED',
  OVERDUE: 'OVERDUE',
  RETURNED: 'RETURNED',
} as const

export type LoanStatus =
  (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS]

export interface LoanRequest {
  bookId: string
  userId: string
  dueDate: string
}

export interface LoanResponse {
  id: string
  bookTitle: string
  userFullName: string
  borrowedAt: string
  dueDate: string
  returnedAt: string | null
  status: LoanStatus
}
