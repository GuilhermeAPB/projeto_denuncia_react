export interface GoogleSheetsResponse {
  status: 'success' | 'error';
  message: string;
  id?: string;
  timestamp?: string;
}

export interface RateLimitInfo {
  isAllowed: boolean;
  waitSeconds: number;
  nextAllowedTime: number;
}

export interface SecurityContext {
  userId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}