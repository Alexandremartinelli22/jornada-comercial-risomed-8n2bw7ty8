import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { RisomedLogo } from '@/components/RisomedLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const { login, requestPasswordReset } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email.trim() || !password) {
      setErrorMsg('Por favor, preencha seu e-mail e senha.')
      return
    }

    try {
      setLoading(true)
      await login(email, password)
      toast({
        title: 'Bem-vindo(a) à Risomed',
        description: 'Autenticação realizada com sucesso.',
      })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Informe seu e-mail no campo acima para redefinir a senha.')
      return
    }
    try {
      await requestPasswordReset(email)
      toast({
        title: 'E-mail enviado',
        description: 'Se o endereço estiver cadastrado, as instruções foram enviadas.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Aviso',
        description: 'Caso o e-mail exista, o link de recuperação foi emitido.',
      })
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#EBF6F8] via-[#F8FAFC] to-[#FEF3EB] p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-8 animate-fade-in-up">
          <div className="flex flex-col items-center text-center mb-8">
            <RisomedLogo size="lg" />
            <h2 className="mt-6 text-2xl font-bold text-[#1B2E5A] tracking-tight font-heading">
              Acesse sua conta
            </h2>
            <p className="mt-1.5 text-xs text-[#64748B] max-w-xs leading-relaxed">
              Diagnóstico que revela. Benefícios que resolvem. Dados que comprovam.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#334155]">
                E-mail corporativo
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="seu.nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm focus-visible:ring-[#1B2E5A] focus-visible:border-[#29AABE]"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pass" className="text-xs font-semibold text-[#334155]">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-[#29AABE] hover:text-[#1E8B9C] hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="pass"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 text-sm pr-10 focus-visible:ring-[#1B2E5A] focus-visible:border-[#29AABE]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#475569]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-[#1B2E5A] hover:bg-[#132140] text-white font-semibold transition active:scale-[0.99] shadow-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Entrar</span>
                  <ArrowRight className="h-4 w-4 text-[#F58220]" />
                </div>
              )}
            </Button>{' '}
          </form>

          {/* Seed demo quick fill */}
          <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('alexandre@armodonto.com')
                setPassword('Skip@Pass')
              }}
              className="text-xs text-[#64748B] hover:text-[#1B2E5A] transition inline-flex items-center gap-1.5 font-medium underline"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#29AABE]" />
              Preencher com usuário demonstrativo
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-[#64748B]">
              Ainda não tem acesso?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#1B2E5A] hover:text-[#29AABE] hover:underline"
              >
                Criar uma conta
              </Link>
            </p>
          </div>
        </div>

        {/* Microcopy Risomed */}
        <p className="mt-6 text-center text-xs text-[#64748B]">
          Risomed · Cuidamos das pessoas. Geramos resultados para empresas.
        </p>
      </div>
    </div>
  )
}
