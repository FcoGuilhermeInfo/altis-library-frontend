import { isRecord } from './apiErrors';

type FieldType = 'string' | 'number' | 'boolean' | 'nullableString' | 'array';

export function unexpectedResponse(): never {
  const error = new Error('Unexpected API response');
  error.name = 'UnexpectedApiResponseError';
  throw error;
}

// Runtime checks for the parts of DTOs consumed by the UI. Axios generics alone
// cannot prevent a proxy HTML page or malformed JSON from being treated as success.
export function validateObject(value: unknown, fields: Record<string, FieldType>): asserts value is Record<string, unknown> {
  if (!isRecord(value)) unexpectedResponse();
  for (const [key, type] of Object.entries(fields)) {
    const field = value[key];
    const valid = type === 'nullableString' ? field === null || typeof field === 'string'
      : type === 'array' ? Array.isArray(field)
      : type === 'number' ? typeof field === 'number' && Number.isFinite(field)
      : typeof field === type;
    if (!valid) unexpectedResponse();
  }
}

export function validatePage(value: unknown, validateItem: (item: unknown) => void): void {
  validateObject(value, { content: 'array', totalElements: 'number', totalPages: 'number', number: 'number', size: 'number', first: 'boolean', last: 'boolean' });
  if (!Array.isArray(value.content)) unexpectedResponse();
  if ([value.totalElements, value.totalPages, value.number, value.size].some(n => typeof n !== 'number' || !Number.isInteger(n) || n < 0)) unexpectedResponse();
  value.content.forEach(validateItem);
}

export function validateBook(value: unknown): void {
  validateObject(value, { id: 'string', title: 'string', author: 'string', releaseYear: 'number', publisherName: 'string', totalQuantity: 'number', availableQuantity: 'number', borrowedQuantity: 'number', createdAt: 'string', updatedAt: 'string' });
}
export function validatePublisher(value: unknown): void {
  validateObject(value, { id: 'string', name: 'string', email: 'string', phone: 'string', site: 'string', createdAt: 'string', updatedAt: 'string' });
}
export function validateUser(value: unknown): void {
  validateObject(value, { id: 'string', name: 'string', email: 'string', admin: 'boolean', active: 'boolean', createdAt: 'string', updatedAt: 'string' });
  const personalField = value.admin === true ? 'nullableString' : 'string';
  validateObject(value, { birthDate: personalField, cpf: personalField, phone: personalField, address: personalField });
}
export function validateLoan(value: unknown): void {
  validateObject(value, { id: 'string', bookTitle: 'string', userFullName: 'string', borrowedAt: 'string', dueDate: 'string', returnedAt: 'nullableString', status: 'string' });
  if (!['BORROWED', 'OVERDUE', 'RETURNED'].includes(String(value.status))) unexpectedResponse();
}
export function validateAdminDashboard(value: unknown): void {
  validateObject(value, { totalBooks: 'number', totalPublishers: 'number', monthlyLoans: 'number', totalUsers: 'number', topBorrowedBooks: 'array' });
  if (value.lastLoan !== null) validateObject(value.lastLoan, { bookTitle: 'string', tenant: 'string', borrowedAt: 'string', dueDate: 'string' });
  const validateTopBook = (book: unknown) => validateObject(book, { bookId: 'string', bookTitle: 'string', loanCount: 'number' });
  if (value.mostBorrowedBook !== null) validateTopBook(value.mostBorrowedBook);
  if (!Array.isArray(value.topBorrowedBooks)) unexpectedResponse();
  value.topBorrowedBooks.forEach(validateTopBook);
}
export function validateUserDashboard(value: unknown): void {
  validateObject(value, { borrowedBooks: 'number', borrowingLimit: 'number', nextReturnDate: 'nullableString', lastBorrowedBook: 'nullableString', lastBorrowedAt: 'nullableString', loans: 'array' });
  if (!Array.isArray(value.loans)) unexpectedResponse();
  value.loans.forEach((loan: unknown) => {
    validateObject(loan, { tenant: 'string', book: 'string', borrowedAt: 'string', dueDate: 'string', returnedAt: 'nullableString', status: 'string' });
    if (!['BORROWED', 'OVERDUE', 'RETURNED'].includes(String(loan.status))) unexpectedResponse();
  });
}
