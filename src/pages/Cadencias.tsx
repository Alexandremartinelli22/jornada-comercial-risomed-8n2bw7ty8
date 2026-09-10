import React, { useState, useEffect } from 'react'
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Mail,
  CheckSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react'
import { crmService } from '@/services/crmService'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'
import type { CadenciaRecord, EtapaCadencia } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export default function Cadencias() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [cadencias, setCadencias] = useState<CadenciaRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Editor Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [etapas, setEtapas] = useState<EtapaCadencia[]>([
    {
      tipo: 'email',
      titulo: 'Diagnóstico de clima e riscos psicossociais na [Nome da Conta]',
      corpo:
        'Olá!\n\nA Risomed entrega o diagnóstico psicossocial da nova NR-1 que revela o risco antes do afastamento, com implantação em 30 dias e sem fidelidade.\n\nPodemos conversar nesta semana?',
      delay_dias: 0,
    },
    {
      tipo: 'tarefa',
      descricao: 'Follow-up telefônico com o RH para confirmar recebimento e agendar demonstração.',
      delay_dias: 2,
    },
  ])
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const data = await crmService.getCadencias()
      setCadencias(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('cadencias', () => loadData())

  const handleOpenCreate = () => {
    setEditingId(null)
    setNome('')
    setDescricao('')
    setEtapas([
      {
        tipo: 'email',
        titulo: 'Apresentação Risomed para [Nome da Conta]',
        corpo:
          'Olá, equipe da [Nome da Conta]!\n\nVocês já conhecem o nosso Pronto Socorro Digital com 20+ especialidades e telemedicina em minutos?',
        delay_dias: 0,
      },
      {
        tipo: 'tarefa',
        descricao:
          'Contato via telefone/WhatsApp para verificar interesse no piloto sem fidelidade.',
        delay_dias: 3,
      },
    ])
    setModalOpen(true)
  }

  const handleOpenEdit = (c: CadenciaRecord) => {
    setEditingId(c.id)
    setNome(c.nome)
    setDescricao(c.descricao || '')
    setEtapas(c.etapas && c.etapas.length > 0 ? c.etapas : [])
    setModalOpen(true)
  }

  const handleToggleStatus = async (c: CadenciaRecord) => {
    const novoStatus = c.status === 'ativa' ? 'pausada' : 'ativa'
    try {
      await crmService.updateCadencia(c.id, { status: novoStatus })
      toast({
        title: novoStatus === 'ativa' ? 'Cadência ativada!' : 'Cadência pausada',
        description:
          novoStatus === 'ativa'
            ? 'Tarefas serão geradas automaticamente para contas em Prospecção.'
            : 'Geração automática de tarefas interrompida.',
      })
      loadData()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao atualizar cadência', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta sequência de cadência?')) return
    try {
      await crmService.deleteCadencia(id)
      toast({ title: 'Cadência removida' })
      loadData()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao remover cadência', variant: 'destructive' })
    }
  }

  const handleAddEtapa = (tipo: 'email' | 'tarefa') => {
    if (tipo === 'email') {
      setEtapas([
        ...etapas,
        {
          tipo: 'email',
          titulo: 'Follow-up sobre saúde corporativa - [Nome da Conta]',
          corpo:
            'Olá!\n\nGostaria de compartilhar como nossos clientes reduziram em até 25% os afastamentos com cuidado contínuo.',
          delay_dias: 3,
        },
      ])
    } else {
      setEtapas([
        ...etapas,
        {
          tipo: 'tarefa',
          descricao: 'Follow-up telefônico com liderança de RH da conta.',
          delay_dias: 2,
        },
      ])
    }
  }

  const handleRemoveEtapa = (idx: number) => {
    setEtapas(etapas.filter((_, i) => i !== idx))
  }

  const handleGerarComIA = (index: number) => {
    const etapaAtual = etapas[index]
    if (etapaAtual.tipo === 'email') {
      const novosEmails = [
        {
          titulo: 'Diagnóstico que revela. Benefícios que resolvem na [Nome da Conta]',
          corpo:
            'Prezada equipe da [Nome da Conta],\n\nSabemos que cada ausência tem um custo que não aparece na folha: sobrecarga do time e perda de produtividade. Na Risomed, identificamos o risco psicossocial antes do afastamento.\n\nPodemos agendar uma demonstração de 15 minutos do piloto sem compromisso?',
        },
        {
          titulo: 'Como a Risomed reduz até 25% em afastamentos na [Nome da Conta]',
          corpo:
            'Olá!\n\nEnquanto planos tradicionais tratam a doença já instalada, a Risomed atua na prevenção: telemedicina 24/7 com mais de 20 especialidades e plano odontológico integrado.\n\nGostaria de conhecer o case de implantação em 30 dias?',
        },
      ]
      const selecionado = novosEmails[index % novosEmails.length]
      const updated = [...etapas]
      updated[index] = { ...updated[index], ...selecionado }
      setEtapas(updated)
      toast({
        title: 'Texto gerado pela IA da Risomed!',
        description: 'Template atualizado com foco em prevenção e vocabulário da marca.',
      })
    } else {
      const novasTarefas = [
        'Ligação de sondagem: verificar percepção da diretoria sobre afastamentos recentes por estresse ou ergonomia.',
        'Envio de convite no LinkedIn ou WhatsApp para líder de Gente & Gestão sobre piloto NR-1.',
      ]
      const updated = [...etapas]
      updated[index] = {
        ...updated[index],
        descricao: novasTarefas[index % novasTarefas.length],
      }
      setEtapas(updated)
      toast({
        title: 'Sugestão de tarefa da IA aplicada!',
      })
    }
  }

  const handleSaveCadencia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' })
      return
    }

    try {
      setSaving(true)
      if (editingId) {
        await crmService.updateCadencia(editingId, {
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
          etapas,
        })
        toast({ title: 'Cadência atualizada com sucesso!' })
      } else {
        await crmService.createCadencia({
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
          etapas,
          status: 'ativa',
          responsavel_id: user?.id,
        })
        toast({
          title: 'Cadência criada e ativada!',
          description: 'A automação começará a nutrir contas em Prospecção.',
        })
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao salvar cadência', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Cadências de Prospecção & Follow-up
          </h2>
          <p className="text-sm text-[#64748B] mt-0.5 max-w-2xl">
            Automatize seus follow-ups. Crie sequências de e-mails e tarefas para acompanhar leads
            ao longo do tempo e transformar dados em fechamentos.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#003882] hover:bg-[#00285e] text-white font-semibold transition active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nova Cadência
        </Button>
      </div>

      {/* Lista de Cadências */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cadencias.map((cad) => {
          const isAtiva = cad.status === 'ativa'
          const etapasList = cad.etapas || []

          return (
            <Card
              key={cad.id}
              className={`rounded-2xl border transition shadow-sm hover:shadow-md ${
                isAtiva ? 'border-[#BBF7D0]' : 'border-[#E2E8F0]'
              }`}
            >
              <CardHeader className="p-5 pb-3 border-b border-[#F8FAFC]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isAtiva ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isAtiva ? (
                        <Play className="h-3 w-3 fill-current" />
                      ) : (
                        <Pause className="h-3 w-3" />
                      )}
                      {isAtiva ? 'Em Execução Automática' : 'Pausada'}
                    </span>
                    <CardTitle className="text-base font-bold text-[#0F172A] mt-2">
                      {cad.nome}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(cad)}
                      className={`h-8 px-2 text-xs font-semibold ${
                        isAtiva
                          ? 'text-amber-700 hover:bg-amber-50'
                          : 'text-[#00A859] hover:bg-emerald-50'
                      }`}
                    >
                      {isAtiva ? 'Pausar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(cad)}
                      className="h-8 px-2 text-xs text-[#003882] hover:bg-blue-50"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cad.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {cad.descricao && (
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{cad.descricao}</p>
                )}
              </CardHeader>
              <CardContent className="p-5 pt-4">
                <div className="text-xs font-bold text-[#475569] mb-3 flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5 text-[#003882]" />
                  Sequência ({etapasList.length} etapas programadas):
                </div>

                <div className="space-y-2">
                  {etapasList.map((et, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] text-xs"
                    >
                      <span className="h-5 w-5 rounded-full bg-white border border-[#CBD5E1] text-[#003882] font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {et.tipo === 'email' ? (
                        <Mail className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <CheckSquare className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      )}
                      <span className="font-semibold text-[#1E293B] truncate flex-1">
                        {et.tipo === 'email' ? et.titulo || 'E-mail' : et.descricao || 'Tarefa'}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] shrink-0">
                        +{et.delay_dias || 0}d
                      </span>
                    </div>
                  ))}

                  {etapasList.length === 0 && (
                    <p className="text-xs text-[#94A3B8] italic">
                      Nenhuma etapa configurada nesta cadência.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Editor Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#003882]">
              {editingId ? 'Editar Cadência Comercial' : 'Criar Sequência de Cadência'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCadencia} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nome-cad" className="text-xs font-semibold text-[#334155]">
                Nome da Cadência *
              </Label>
              <Input
                id="nome-cad"
                required
                placeholder="Ex.: Nutrição de Diretores de RH - Diagnóstico NR-1"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc-cad" className="text-xs font-semibold text-[#334155]">
                Objetivo / Descrição
              </Label>
              <Input
                id="desc-cad"
                placeholder="Ex.: Sequência focada em empresas médias com absenteísmo alto..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Etapas */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#0F172A]">
                  Etapas da Sequência ({etapas.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddEtapa('email')}
                    className="h-7 text-xs border-[#CBD5E1]"
                  >
                    <Mail className="h-3 w-3 mr-1 text-amber-600" />+ E-mail
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddEtapa('tarefa')}
                    className="h-7 text-xs border-[#CBD5E1]"
                  >
                    <CheckSquare className="h-3 w-3 mr-1 text-sky-600" />+ Tarefa
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {etapas.map((et, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-[#003882] text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#1E293B] uppercase">
                          {et.tipo === 'email' ? 'Etapa E-mail' : 'Etapa Tarefa'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botão Gerar com IA */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGerarComIA(idx)}
                          className="h-6 px-2 text-[11px] text-[#00A859] hover:bg-[#EBF7F0] font-bold flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          Gerar com IA
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleRemoveEtapa(idx)}
                          className="text-[#94A3B8] hover:text-red-600 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-[#94A3B8]" />
                      <span className="text-[#64748B]">Aguardar</span>
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        value={et.delay_dias}
                        onChange={(e) => {
                          const updated = [...etapas]
                          updated[idx].delay_dias = parseInt(e.target.value, 10) || 0
                          setEtapas(updated)
                        }}
                        className="h-7 w-16 text-center text-xs bg-white"
                      />
                      <span className="text-[#64748B]">dias após a etapa anterior</span>
                    </div>

                    {et.tipo === 'email' ? (
                      <div className="space-y-2 pt-1">
                        <Input
                          placeholder="Assunto do e-mail (use [Nome da Conta] como placeholder)"
                          value={et.titulo || ''}
                          onChange={(e) => {
                            const updated = [...etapas]
                            updated[idx].titulo = e.target.value
                            setEtapas(updated)
                          }}
                          className="h-8 text-xs bg-white"
                        />
                        <Textarea
                          placeholder="Corpo do e-mail..."
                          value={et.corpo || ''}
                          onChange={(e) => {
                            const updated = [...etapas]
                            updated[idx].corpo = e.target.value
                            setEtapas(updated)
                          }}
                          className="text-xs bg-white resize-none"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <div className="pt-1">
                        <Input
                          placeholder="Descrição da ação de follow-up a ser gerada..."
                          value={et.descricao || ''}
                          onChange={(e) => {
                            const updated = [...etapas]
                            updated[idx].descricao = e.target.value
                            setEtapas(updated)
                          }}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-[#003882] hover:bg-[#00285e] text-white"
              >
                {saving ? 'Salvando...' : 'Salvar Cadência'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
