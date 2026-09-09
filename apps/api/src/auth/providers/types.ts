/**
 * Where an identity comes from.
 *
 * Both providers answer the same question — "who is this?" — and neither
 * decides what the person may do. Authorisation is always read from our own
 * user row, so moving from passwords to an identity provider never hands
 * someone else control of access.
 */
export interface ExternalIdentity {
  /** "local", or the OIDC issuer URL. */
  issuer: string;
  /** The provider's stable subject. For local accounts, our own user id. */
  subject: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

export class AuthenticationError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "AuthenticationError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
