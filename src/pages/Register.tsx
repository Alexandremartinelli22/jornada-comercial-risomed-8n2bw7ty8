import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, ArrowRight, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { RisomedLogo } from '@/components/RisomedLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Preencha todos os campos obrigatórios.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('A senha precisa ter no mínimo 8 caracteres.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMsg('As senhas digitadas não coincidem.')
      return
    }

    try {
      setLoading(true)
      await register(name, email, password)
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo(a) à plataforma comercial da Risomed.',
      })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg('Não foi possível concluir o cadastro. O e-mail pode já estar em uso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F0F5FA] via-[#F8FAFC] to-[#E9F3EE] p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-8 animate-fade-in-up">
          <div className="flex flex-col items-center text-center mb-6">
            <RisomedLogo size="lg" />
            <h2 className="mt-6 text-2xl font-bold text-[#0F172A] tracking-tight">
              Criar nova conta
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">Junte-se ao time comercial da Risomed.</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-xs font-semibold text-[#334155]">
                Nome completo
              </Label>
              <Input
                id="nome"
                type="text"
                required
                placeholder="Ex.: Carolina Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-sm focus-visible:ring-[#003882]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-[#334155]">
                E-mail corporativo
              </Label>
              <Input
                id="reg-email"
                type="email"
                required
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm focus-visible:ring-[#003882]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-pass" className="text-xs font-semibold text-[#334155]">
                Senha (mínimo 8 caracteres)
              </Label>
              <div className="relative">
                <Input
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 text-sm pr-10 focus-visible:ring-[#003882]"
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

            <div className="space-y-1.5">
              <Label htmlFor="reg-pass-conf" className="text-xs font-semibold text-[#334155]">
                Confirmação de senha
              </Label>
              <Input
                id="reg-pass-conf"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="h-10 text-sm focus-visible:ring-[#003882]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-[#00A859] hover:bg-[#008f4c] text-white font-semibold transition active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Cadastrando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Criar conta</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#64748B]">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold text-[#003882] hover:underline">
                Voltar ao login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
