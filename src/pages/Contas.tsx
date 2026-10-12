import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Plus,
  Search,
  Filter,
  DollarSign,
  Phone,
  Globe,
  ExternalLink,
  Users,
} from 'lucide-react'
import { crmService } from '@/services/crmService'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'
import type { ContaRecord, NegocioRecord, StatusConta } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

const STATUS_CORES: Record<StatusConta, { bg: string; text: string }> = {
  Prospecção: { bg: 'bg-slate-100', text: 'text-slate-800' },
  Diagnóstico: { bg: 'bg-sky-100', text: 'text-sky-800' },
  Proposta: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Negociação: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Fechado: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
}

export default function Contas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [contas, setContas] = useState<ContaRecord[]>([])
  const [negocios, setNegocios] = useState<NegocioRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  // Modal Nova Conta
  const [modalOpen, setModalOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [setor, setSetor] = useState('')
  const [tamanho, setTamanho] = useState<'Pequeno' | 'Médio' | 'Grande'>('Médio')
  const [site, setSite] = useState('')
  const [telefone, setTelefone] = useState('')
  const [status, setStatus] = useState<StatusConta>('Prospecção')
  const [criarNegocioJunto, setCriarNegocioJunto] = useState(false)
  const [valorNegocio, setValorNegocio] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const [cData, nData] = await Promise.all([crmService.getContas(), crmService.getNegocios()])
      setContas(cData)
      setNegocios(nData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('contas', () => loadData())
  useRealtime('negocios', () => loadData())

  // Receita potencial por conta
  const potenciais = useMemo(() => {
    const map: Record<string, number> = {}
    negocios.forEach((n) => {
      if (!map[n.conta_id]) map[n.conta_id] = 0
      map[n.conta_id] += n.valor || 0
    })
    return map
  }, [negocios])

  // Contas filtradas
  const filteredContas = useMemo(() => {
    return contas.filter((c) => {
      const matchSearch =
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.setor && c.setor.toLowerCase().includes(search.toLowerCase())) ||
        (c.cnpj && c.cnpj.includes(search))

      const matchStatus = statusFilter === 'todos' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [contas, search, statusFilter])

  const handleOpenModal = () => {
    setNome('')
    setCnpj('')
    setSetor('')
    setTamanho('Médio')
    setSite('')
    setTelefone('')
    setStatus('Prospecção')
    setCriarNegocioJunto(false)
    setValorNegocio('')
    setModalOpen(true)
  }

  const handleCreateConta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe a razão social ou nome fantasia da conta.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const novaConta = await crmService.createConta({
        nome: nome.trim(),
        cnpj: cnpj.trim() || undefined,
        setor: setor.trim() || undefined,
        tamanho,
        site: site.trim() || undefined,
        telefone: telefone.trim() || undefined,
        status,
        responsavel_id: user?.id,
      })

      if (criarNegocioJunto && valorNegocio) {
        const val = parseFloat(valorNegocio.replace(/\./g, '').replace(',', '.')) || 0
        if (val > 0) {
          await crmService.createNegocio({
            nome: `Implantação Risomed - ${novaConta.nome}`,
            conta_id: novaConta.id,
            valor: val,
            etapa: status === 'Fechado' ? 'Fechamento' : status,
            responsavel_id: user?.id,
          })
        }
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: `${novaConta.nome} agora faz parte da jornada comercial.`,
      })
      setModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar conta',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2E5A] tracking-tight font-heading">
            Contas Comerciais
          </h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Cuidamos das pessoas. Geramos resultados para empresas.
          </p>
        </div>

        <Button
          onClick={handleOpenModal}
          className="bg-[#1B2E5A] hover:bg-[#132140] text-white font-semibold transition active:scale-[0.98] self-start sm:self-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5 text-[#F58220]" />
          Nova Conta
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0]">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-[#94A3B8]" />
          <Input
            placeholder="Buscar por nome da empresa, setor ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">Estágio:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="text-xs">
                Todos os estágios
              </SelectItem>
              <SelectItem value="Prospecção" className="text-xs">
                Prospecção
              </SelectItem>
              <SelectItem value="Diagnóstico" className="text-xs">
                Diagnóstico
              </SelectItem>
              <SelectItem value="Proposta" className="text-xs">
                Proposta
              </SelectItem>
              <SelectItem value="Negociação" className="text-xs">
                Negociação
              </SelectItem>
              <SelectItem value="Fechado" className="text-xs">
                Fechado
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de Contas (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="py-3 px-5">Empresa</th>
                <th className="py-3 px-4">Setor / Porte</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">Estágio</th>
                <th className="py-3 px-4 text-right">Receita Potencial</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredContas.map((c) => {
                const resp = c.expand?.responsavel_id?.name || 'Equipe Risomed'
                const potencial = potenciais[c.id] || 0
                const badge = STATUS_CORES[c.status] || STATUS_CORES.Prospecção

                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/contas/${c.id}`)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition"
                  >
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-[#0F172A] text-sm hover:text-[#1B2E5A]">
                        {c.nome}
                      </p>
                      {c.cnpj && <p className="text-[11px] text-[#94A3B8]">{c.cnpj}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <p>{c.setor || 'Geral'}</p>
                      <span className="text-[10px] text-[#94A3B8]">
                        Porte {c.tamanho || 'Médio'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <span className="font-medium">{resp}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#1B2E5A]">
                      R$ {potencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#1B2E5A] hover:bg-[#EBF6F8] hover:text-[#29AABE] h-7 px-2.5"
                      >
                        Ver Perfil
                      </Button>
                    </td>
                  </tr>
                )
              })}

              {filteredContas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#94A3B8]">
                    Nenhuma conta encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards empilhados */}
        <div className="sm:hidden divide-y divide-[#F1F5F9]">
          {filteredContas.map((c) => {
            const badge = STATUS_CORES[c.status] || STATUS_CORES.Prospecção
            const potencial = potenciais[c.id] || 0

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/contas/${c.id}`)}
                className="p-4 hover:bg-[#F8FAFC] active:bg-[#F1F5F9] cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-[#0F172A]">{c.nome}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  {c.setor || 'Geral'} • {c.tamanho || 'Médio'}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-[#94A3B8]">Potencial:</span>
                  <span className="font-bold text-[#1B2E5A]">
                    R$ {potencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Nova Conta */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1B2E5A] font-heading">
              {editId ? 'Editar Conta' : 'Nova Conta Corporativa'}
            </DialogTitle>
          </DialogHeader>{' '}
          <form onSubmit={handleCreateConta} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="nome-conta" className="text-xs font-semibold text-[#334155]">
                Razão Social ou Nome Fantasia *
              </Label>
              <Input
                id="nome-conta"
                required
                placeholder="Ex.: Grupo BioSaúde S/A"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cnpj-conta" className="text-xs font-semibold text-[#334155]">
                  CNPJ
                </Label>
                <Input
                  id="cnpj-conta"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="setor-conta" className="text-xs font-semibold text-[#334155]">
                  Setor
                </Label>
                <Input
                  id="setor-conta"
                  placeholder="Ex.: Indústria, Varejo"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#334155]">Porte da Empresa</Label>
                <Select
                  value={tamanho}
                  onValueChange={(val) => setTamanho(val as 'Pequeno' | 'Médio' | 'Grande')}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeno" className="text-xs">
                      Pequeno (até 99 vidas)
                    </SelectItem>
                    <SelectItem value="Médio" className="text-xs">
                      Médio (100 a 499 vidas)
                    </SelectItem>
                    <SelectItem value="Grande" className="text-xs">
                      Grande (500+ vidas)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#334155]">Estágio Inicial</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as StatusConta)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospecção" className="text-xs">
                      Prospecção
                    </SelectItem>
                    <SelectItem value="Diagnóstico" className="text-xs">
                      Diagnóstico
                    </SelectItem>
                    <SelectItem value="Proposta" className="text-xs">
                      Proposta
                    </SelectItem>
                    <SelectItem value="Negociação" className="text-xs">
                      Negociação
                    </SelectItem>
                    <SelectItem value="Fechado" className="text-xs">
                      Fechado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tel-conta" className="text-xs font-semibold text-[#334155]">
                  Telefone de Contato
                </Label>
                <Input
                  id="tel-conta"
                  placeholder="(11) 99999-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="site-conta" className="text-xs font-semibold text-[#334155]">
                  Site
                </Label>
                <Input
                  id="site-conta"
                  type="url"
                  placeholder="https://..."
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Criar negócio associado */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={criarNegocioJunto}
                  onChange={(e) => setCriarNegocioJunto(e.target.checked)}
                  className="rounded text-[#003882] focus:ring-[#003882] h-4 w-4"
                />
                <span className="text-xs font-semibold text-[#1E293B]">
                  Criar oportunidade/negócio vinculada imediatamente
                </span>
              </label>

              {criarNegocioJunto && (
                <div className="p-3 bg-[#F0F5FA] rounded-lg border border-[#DCE7F3] space-y-1 animate-fade-in-up">
                  <Label htmlFor="val-neg-rapido" className="text-xs font-semibold text-[#003882]">
                    Valor do Negócio (R$)
                  </Label>
                  <Input
                    id="val-neg-rapido"
                    placeholder="Ex.: 35000"
                    value={valorNegocio}
                    onChange={(e) => setValorNegocio(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-[#1B2E5A] hover:bg-[#132140] text-white font-semibold"
              >
                {saving ? 'Cadastrando...' : 'Cadastrar Conta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
