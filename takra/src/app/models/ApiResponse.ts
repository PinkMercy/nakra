export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: string;
}