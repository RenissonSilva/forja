import { AuthUser, SignUpResult } from "@domain/entities/AuthUser";
import { AuthRepository } from "@domain/repositories/AuthRepository";
import {
  AuthRequestFailedError,
  EmailAlreadyInUseError,
  InvalidCredentialsError,
} from "@domain/errors/AuthErrors";
import type { Session, User } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../supabase/supabaseClient";

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email ?? null };
}

export class SupabaseAuthRepository implements AuthRepository {
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new AuthRequestFailedError(error.message);
    return data.session ? toAuthUser(data.session.user) : null;
  }

  async signUpWithEmail(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        throw new EmailAlreadyInUseError();
      }
      throw new AuthRequestFailedError(error.message);
    }
    if (!data.user) throw new AuthRequestFailedError();
    return { user: toAuthUser(data.user), requiresEmailConfirmation: !data.session };
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new InvalidCredentialsError();
    return toAuthUser(data.user);
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const redirectTo = AuthSession.makeRedirectUri({ scheme: "forja" });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw new AuthRequestFailedError(error?.message);

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success" || !result.url) {
      throw new AuthRequestFailedError("Login com Google cancelado.");
    }

    return this.completeGoogleSession(result.url);
  }

  private async completeGoogleSession(returnedUrl: string): Promise<AuthUser> {
    const url = new URL(returnedUrl);
    const queryParams = new URLSearchParams(url.search);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

    // PKCE flow: the callback carries a one-time code to exchange for a session.
    const code = queryParams.get("code");
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.user) throw new AuthRequestFailedError(error?.message);
      return toAuthUser(data.user);
    }

    // Implicit flow: the callback carries the session tokens directly in the fragment.
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error || !data.user) throw new AuthRequestFailedError(error?.message);
      return toAuthUser(data.user);
    }

    throw new AuthRequestFailedError("Resposta inválida do login com Google.");
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AuthRequestFailedError(error.message);
  }

  onAuthStateChange(listener: (user: AuthUser | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      listener(session ? toAuthUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }
}
