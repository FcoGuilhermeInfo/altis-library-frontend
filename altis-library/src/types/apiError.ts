// GlobalExceptionHandler / ApiErrorResponse in the current Spring backend.
export interface FieldValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string | FieldValidationError[];
}
