
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AtSign } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Logo } from '@/components/shared/Logo';
import { Input } from '@/components/ui/input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Integrar com o endpoint de recuperação de senha
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted/50 blur-3xl" />

      <div className="mb-7">
        <Logo size="md" />
      </div>

      <div className="w-full max-w-[440px] rounded-3xl border border-border bg-card p-8 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-[26px] font-bold text-card-foreground">
            Recupere sua senha
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Informe seu e-mail para receber as instruções de recuperação de
            acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold text-foreground"
            >
              E-mail
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Digite seu e-mail"
              startIcon={<AtSign className="size-4" />}
              autoComplete="email"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 active:scale-[0.99]"
            >
              <span>Enviar instruções</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 hover:underline"
          >
            <ArrowLeft className="size-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
