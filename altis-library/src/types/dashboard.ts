
import type { LoanStatus } from '@/types/loan'

export interface LastLoanDashboard {
  bookTitle: string
  tenant: string
  borrowedAt: string
  dueDate: string
}

export interface MostBorrowedBook {
  bookId: string
  bookTitle: string
  loanCount: number
}

export interface AdminDashboardResponse {
  totalBooks: number
  totalPublishers: number
  monthlyLoans: number
  totalUsers: number

  lastLoan: LastLoanDashboard | null
  mostBorrowedBook: MostBorrowedBook | null
  topBorrowedBooks: MostBorrowedBook[]
}

export interface UserLoanDashboard {
  tenant: string
  book: string
  borrowedAt: string
  dueDate: string
  returnedAt: string | null
  status: LoanStatus
}

export interface UserDashboardResponse {
  borrowedBooks: number
  borrowingLimit: number
  nextReturnDate: string | null
  lastBorrowedBook: string | null
  lastBorrowedAt: string | null

  loans: UserLoanDashboard[]
}
