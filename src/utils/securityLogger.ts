export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'TOKEN_REFRESHED'
  | 'TOKEN_REVOKED'
  | 'UNAUTHORIZED_ACCESS'
  | 'FORBIDDEN_ACCESS'
  | 'ADMIN_MUTATION'
  | 'VALIDATION_FAILED';

export interface SecurityLogParams {
  event: SecurityEventType;
  ip?: string;
  userId?: string;
  email?: string;
  details?: string;
  path?: string;
  method?: string;
}

export const logSecurityEvent = (params: SecurityLogParams): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event: params.event,
    ip: params.ip || 'unknown',
    ...(params.userId && { userId: params.userId }),
    ...(params.email && { email: params.email }),
    ...(params.method && { method: params.method }),
    ...(params.path && { path: params.path }),
    ...(params.details && { details: params.details }),
  };

  // Safe logging: never print passwords, hashes, tokens, or private secrets
  console.log(`[SECURITY_AUDIT] ${JSON.stringify(logEntry)}`);
};
