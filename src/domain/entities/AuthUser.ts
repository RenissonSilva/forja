export interface AuthUser {
  id: string;
  email: string | null;
}

export interface SignUpResult {
  user: AuthUser;
  /** True when the provider requires the user to click a confirmation link before a session exists. */
  requiresEmailConfirmation: boolean;
}
