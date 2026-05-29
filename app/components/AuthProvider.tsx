'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import type { UserRole } from '../lib/supabaseStore';

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signUp: (args: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) => Promise<{ ok: boolean; message: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // profiles テーブルから自分のプロフィールを取得
  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (data) {
      setProfile({ id: data.id, name: data.name, email: data.email ?? '', role: data.role });
    } else {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    // 初回: 既存セッションを取得
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    // セッション変化を監視
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // よくあるエラーを日本語に
      const msg =
        error.message.includes('Invalid login')
          ? 'メールアドレスまたはパスワードが正しくありません'
          : error.message.includes('Email not confirmed')
            ? 'メールの確認が完了していません。受信メールのリンクを確認してください'
            : error.message;
      return { ok: false, message: msg };
    }
    return { ok: true, message: 'ログインしました' };
  }, []);

  const signUp = useCallback(
    async ({
      email,
      password,
      name,
      role,
    }: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
    }) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        const msg = error.message.includes('already registered')
          ? 'このメールアドレスは既に登録されています'
          : error.message;
        return { ok: false, message: msg };
      }
      // profiles に行を作成（id = auth.uid）
      if (data.user) {
        const { error: pErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          role,
        });
        if (pErr) return { ok: false, message: `プロフィール作成に失敗: ${pErr.message}` };
      }
      // メール確認が有効な場合 session が null になる
      const needsConfirm = !data.session;
      return {
        ok: true,
        message: needsConfirm
          ? '確認メールを送信しました。メール内のリンクをクリックして登録を完了してください'
          : '登録が完了しました',
      };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
