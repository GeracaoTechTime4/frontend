import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AtSign, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, User } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { TAMANHO_MINIMO_SENHA } from "@/services/auth";

export const RegisterPage: React.FC = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < TAMANHO_MINIMO_SENHA) {
      setErrorMessage(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
      return;
    }

    try {
      setIsLoading(true);
      const sessao = await register({ name: name.trim(), email: email.trim(), password });
      // O cadastro já inicia a sessão; "/" leva cada papel para a sua tela inicial.
      navigate(sessao ? "/" : "/login", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quem já está logado não precisa ver o formulário.
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f8fafc] relative overflow-hidden select-none">
      {/* Glow radial sutil de fundo para destacar o card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-cyan-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header com a Marca ScaleOps */}
      <div className="mb-7">
        <Logo size="md" />
      </div>

      {/* Card de Cadastro */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] border border-slate-100/80 transition-all">
        {/* Título e Subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
            Crie sua conta
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-normal leading-relaxed">
            Cadastre-se para consultar e trocar seus turnos
          </p>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5 text-red-600 text-xs font-medium animate-in fade-in-50 duration-200">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-800 mb-2"
            >
              Nome completo
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ana Silva"
              startIcon={<User className="size-4" />}
              required
            />
          </div>

          {/* Campo E-mail */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-800 mb-2"
            >
              E-mail profissional
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@empresa.com.br"
              startIcon={<AtSign className="size-4" />}
              autoComplete="email"
              required
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-800 mb-2"
            >
              Senha corporativa
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              startIcon={<Lock className="size-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
              autoComplete="new-password"
              required
            />
          </div>

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <span>Cadastrar</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Rodapé: Link para Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
