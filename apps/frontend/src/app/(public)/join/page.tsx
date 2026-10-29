'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';

type Mode = 'register' | 'login';

const DASHBOARD_ROUTE = '/dashboard';

const INPUT_CLASS = 'border-white/20 bg-white/5 text-white placeholder:text-white/40';

export default function JoinPage() {
  const [mode, setMode] = useState<Mode>('register');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === 'authenticated') {
      router.replace(DASHBOARD_ROUTE);
    }
  }, [auth.status, router]);

  const isRegister = mode === 'register';

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const locale = navigator.language;

    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          password: data.get('password'),
        }),
      });

      if (response.ok) {
        toast.success(getMessage('REGISTER_SUCCESS', { locale }));
        form.reset();
        return;
      }

      const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      const codes = body?.errors?.length ? body.errors : ['DEFAULT_API_ERROR'];

      for (const code of codes) {
        toast.error(getMessage(code, { locale }));
      }
    } catch {
      toast.error(getMessage('DEFAULT_API_ERROR', { locale }));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const locale = navigator.language;

    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          password: data.get('password'),
        }),
      });

      if (response.ok) {
        const body = (await response.json()) as { token: string };
        auth.login(body.token);
        router.push(DASHBOARD_ROUTE);
        return;
      }

      const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      const codes = body?.errors?.length ? body.errors : ['DEFAULT_API_ERROR'];

      for (const code of codes) {
        toast.error(getMessage(code, { locale }));
      }
    } catch {
      toast.error(getMessage('DEFAULT_API_ERROR', { locale }));
    } finally {
      setSubmitting(false);
    }
  }

  if (auth.status !== 'unauthenticated') return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
            <BrainCircuit className="size-7 text-amber-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight">Banco de Ideias</h1>
            <p className="mt-1 text-sm text-white/50">
              {isRegister ? 'Crie sua conta para começar' : 'Entre na sua conta para continuar'}
            </p>
          </div>
        </div>

        {isRegister ? (
          <form onSubmit={handleRegister} className="flex w-full flex-col gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" type="text" required className={INPUT_CLASS} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required className={INPUT_CLASS} />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required className={INPUT_CLASS} />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full bg-amber-400 font-bold text-black hover:bg-amber-300"
            >
              Cadastrar
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="flex w-full flex-col gap-4">
            <div>
              <Label htmlFor="login-email">E-mail</Label>
              <Input id="login-email" name="email" type="email" required className={INPUT_CLASS} />
            </div>
            <div>
              <Label htmlFor="login-password">Senha</Label>
              <Input id="login-password" name="password" type="password" required className={INPUT_CLASS} />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full bg-amber-400 font-bold text-black hover:bg-amber-300"
            >
              Entrar
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setMode(isRegister ? 'login' : 'register')}
          className="text-sm text-white/60 transition-colors hover:text-white"
        >
          {isRegister ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastre-se'}
        </button>

        <Link
          href="/"
          className="text-xs text-white/30 transition-colors hover:text-white/60"
        >
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}
