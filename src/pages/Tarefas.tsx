import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  Plus,
  PhoneCall,
  Mail,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { crmService } from '@/services/crmService'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'
import type { TarefaRecord, ContaRecord, TipoTarefa, PrioridadeTarefa } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

export default function Tarefas() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [tarefas, setTarefas] = useState<TarefaRecord[]>([])
  const [contas, setContas] = useState<ContaRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<'todas' | 'pendente' | 'concluida'>('pendente')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')

  // Modal Nova Tarefa
  const [modalOpen, setModalOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contaId, setContaId] = useState('')
  const [tipo, setTipo] = useState<TipoTarefa>('call')
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('Média')
  const [dataVencimento, setDataVencimento] = useState('')
  const [descricao, setDescricao] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const [tData, cData] = await Promise.all([
        crmService.getTarefas('', 'data_vencimento'),
        crmService.getContas(),
      ])
      setTarefas(tData)
      setContas(cData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('tarefas', () => loadData())

  const handleToggleStatus = async (tarefa: TarefaRecord) => {
    const novoStatus = tarefa.status === 'pendente' ? 'concluida' : 'pendente'
    try {
      await crmService.updateTarefa(tarefa.id, { status: novoStatus })
      toast({
        title: novoStatus === 'concluida' ? 'Tarefa concluída!' : 'Tarefa reaberta',
        description: `"${tarefa.titulo}" foi atualizada.`,
      })
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao atualizar tarefa',
        variant: 'destructive',
      })
    }
  }

  const handleCreateTarefa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !contaId || !dataVencimento) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o título, selecione a conta e defina a data de vencimento.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      await crmService.createTarefa({
        titulo: titulo.trim(),
        conta_id: contaId,
        tipo,
        prioridade,
        data_vencimento: new Date(dataVencimento).toISOString(),
        status: 'pendente',
        responsavel_id: user?.id,
        origem: 'manual',
        descricao: descricao.trim() || undefined,
      })

      toast({
        title: 'Tarefa cadastrada!',
        description: 'Lembrete agendado com sucesso.',
      })
      setModalOpen(false)
      setTitulo('')
      setDescricao('')
      setDataVencimento('')
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar tarefa',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Filtragem
  const filteredTarefas = useMemo(() => {
    return tarefas.filter((t) => {
      const matchStatus = statusFilter === 'todas' || t.status === statusFilter
      const matchTipo = tipoFilter === 'todos' || t.tipo === tipoFilter
      return matchStatus && matchTipo
    })
  }, [tarefas, statusFilter, tipoFilter])

  // Checagem de vencimento em 24h ou atrasada
  const isVencendoOuAtrasada = (vencimentoStr: string, status: string) => {
    if (status === 'concluida') return false
    const agora = new Date().getTime()
    const venc = new Date(vencimentoStr).getTime()
    const diffHoras = (venc - agora) / (1000 * 60 * 60)
    return diffHoras <= 24 // vencendo em 24h ou atrasada
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Gestão de Tarefas & Follow-up
          </h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Organize contatos, reuniões e lembretes automáticos gerados pelas cadências.
          </p>
        </div>

        <Button
          onClick={() => {
            setTitulo('')
            setContaId(contas[0]?.id || '')
            setTipo('call')
            setPrioridade('Média')
            setDataVencimento('')
            setDescricao('')
            setModalOpen(true)
          }}
          className="bg-[#003882] hover:bg-[#00285e] text-white font-semibold transition active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#64748B]">Status:</span>
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter('pendente')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                statusFilter === 'pendente'
                  ? 'bg-white text-[#003882] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Pendentes
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('concluida')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                statusFilter === 'concluida'
                  ? 'bg-white text-[#003882] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Concluídas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('todas')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                statusFilter === 'todas'
                  ? 'bg-white text-[#003882] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <span className="text-xs font-semibold text-[#64748B]">Tipo:</span>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="text-xs">
                Todos os tipos
              </SelectItem>
              <SelectItem value="call" className="text-xs">
                Ligações
              </SelectItem>
              <SelectItem value="email" className="text-xs">
                E-mails
              </SelectItem>
              <SelectItem value="reuniao" className="text-xs">
                Reuniões
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-4">Tarefa</th>
                <th className="py-3 px-4">Conta Vinculada</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4 text-right">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredTarefas.map((t) => {
                const isConcluida = t.status === 'concluida'
                const urgente = isVencendoOuAtrasada(t.data_vencimento, t.status)
                const contaNome = t.expand?.conta_id?.nome || 'Conta vinculada'

                return (
                  <tr
                    key={t.id}
                    className={`transition hover:bg-[#F8FAFC] ${
                      urgente ? 'bg-orange-50/40 hover:bg-orange-50/70' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        aria-label={isConcluida ? 'Reabrir tarefa' : 'Concluir tarefa'}
                        onClick={() => handleToggleStatus(t)}
                        className={`h-5 w-5 rounded border flex items-center justify-center transition ${
                          isConcluida
                            ? 'bg-[#00A859] border-[#00A859] text-white'
                            : 'border-[#CBD5E1] hover:border-[#003882] bg-white'
                        }`}
                      >
                        {isConcluida && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <p
                        className={`font-bold text-xs ${
                          isConcluida ? 'line-through text-[#94A3B8]' : 'text-[#0F172A]'
                        }`}
                      >
                        {t.titulo}
                      </p>
                      {t.descricao && (
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                          {t.descricao}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/contas/${t.conta_id}`}
                        className="font-medium text-[#003882] hover:underline"
                      >
                        {contaNome}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#475569]">
                        {t.tipo === 'call' && <PhoneCall className="h-3 w-3 text-sky-600" />}
                        {t.tipo === 'email' && <Mail className="h-3 w-3 text-amber-600" />}
                        {t.tipo === 'reuniao' && <Users className="h-3 w-3 text-purple-600" />}
                        {t.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.prioridade === 'Alta'
                            ? 'bg-red-100 text-red-800'
                            : t.prioridade === 'Média'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {t.prioridade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {urgente && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                        <span
                          className={`text-xs ${
                            urgente ? 'font-bold text-amber-700' : 'text-[#475569]'
                          }`}
                        >
                          {new Date(t.data_vencimento).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.origem === 'cadencia'
                            ? 'bg-[#EBF7F0] text-[#00A859]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.origem === 'cadencia' ? 'Cadência IA' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {filteredTarefas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#94A3B8]">
                    Nenhuma tarefa pendente para esta visualização.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#003882]">
              Nova Tarefa de Follow-up
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTarefa} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="tit-tar" className="text-xs font-semibold text-[#334155]">
                Título da tarefa *
              </Label>
              <Input
                id="tit-tar"
                required
                placeholder="Ex.: Ligar para alinhar apresentação da NR-1"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#334155]">Conta relacionada *</Label>
              <Select value={contaId} onValueChange={setContaId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione a empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {contas.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#334155]">Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoTarefa)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call" className="text-xs">
                      Ligação
                    </SelectItem>
                    <SelectItem value="email" className="text-xs">
                      E-mail
                    </SelectItem>
                    <SelectItem value="reuniao" className="text-xs">
                      Reunião
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#334155]">Prioridade</Label>
                <Select
                  value={prioridade}
                  onValueChange={(v) => setPrioridade(v as PrioridadeTarefa)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa" className="text-xs">
                      Baixa
                    </SelectItem>
                    <SelectItem value="Média" className="text-xs">
                      Média
                    </SelectItem>
                    <SelectItem value="Alta" className="text-xs">
                      Alta
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="venc-tar" className="text-xs font-semibold text-[#334155]">
                Data de Vencimento *
              </Label>
              <Input
                id="venc-tar"
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc-tar" className="text-xs font-semibold text-[#334155]">
                Observações / Roteiro
              </Label>
              <Textarea
                id="desc-tar"
                placeholder="Pontos para abordar na ligação ou reunião..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="text-xs resize-none"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-[#003882] hover:bg-[#00285e] text-white"
              >
                {saving ? 'Salvando...' : 'Criar Tarefa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
