import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, DollarSign, Calendar, Building } from 'lucide-react'
import { crmService } from '@/services/crmService'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'
import type { NegocioRecord, ContaRecord, EtapaNegocio } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const ETAPAS: { id: EtapaNegocio; label: string; color: string }[] = [
  { id: 'Prospecção', label: 'Prospecção', color: '#64748B' },
  { id: 'Diagnóstico', label: 'Diagnóstico', color: '#29AABE' },
  { id: 'Proposta', label: 'Proposta', color: '#1B2E5A' },
  { id: 'Negociação', label: 'Negociação', color: '#4A6FA5' },
  { id: 'Fechamento', label: 'Fechamento', color: '#F58220' },
]

export default function Pipeline() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [negocios, setNegocios] = useState<NegocioRecord[]>([])
  const [contas, setContas] = useState<ContaRecord[]>([])

  // Modal Novo Negócio
  const [modalOpen, setModalOpen] = useState(false)
  const [newNome, setNewNome] = useState('')
  const [newContaId, setNewContaId] = useState('')
  const [newValor, setNewValor] = useState('')
  const [newEtapa, setNewEtapa] = useState<EtapaNegocio>('Prospecção')
  const [newPrevisao, setNewPrevisao] = useState('')
  const [newObs, setNewObs] = useState('')
  const [saving, setSaving] = useState(false)

  // Drag and Drop state
  const [draggedNegocioId, setDraggedNegocioId] = useState<string | null>(null)
  const [targetColumn, setTargetColumn] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [negData, contasData] = await Promise.all([
        crmService.getNegocios(),
        crmService.getContas(),
      ])
      setNegocios(negData)
      setContas(contasData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('negocios', () => loadData())
  useRealtime('contas', () => loadData())

  const handleOpenModal = (etapaPadrao?: EtapaNegocio) => {
    setNewNome('')
    setNewContaId(contas[0]?.id || '')
    setNewValor('')
    setNewEtapa(etapaPadrao || 'Prospecção')
    setNewPrevisao('')
    setNewObs('')
    setModalOpen(true)
  }

  const handleSaveNegocio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNome.trim() || !newContaId || !newValor) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome do negócio, selecione a conta e digite o valor.',
        variant: 'destructive',
      })
      return
    }

    const valorNum = parseFloat(newValor.replace(/\./g, '').replace(',', '.')) || 0
    if (valorNum <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Digite um valor comercial válido.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      await crmService.createNegocio({
        nome: newNome.trim(),
        conta_id: newContaId,
        valor: valorNum,
        etapa: newEtapa,
        previsao_fechamento: newPrevisao ? new Date(newPrevisao).toISOString() : undefined,
        responsavel_id: user?.id,
        observacoes: newObs.trim() || undefined,
      })

      toast({
        title: 'Negócio criado!',
        description: `Oportunidade inserida na etapa ${newEtapa}.`,
      })
      setModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar',
        description: 'Não foi possível salvar a oportunidade.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggedNegocioId(id)
  }

  const handleDragOver = (e: React.DragEvent, etapa: string) => {
    e.preventDefault()
    if (targetColumn !== etapa) {
      setTargetColumn(etapa)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setTargetColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, novaEtapa: EtapaNegocio) => {
    e.preventDefault()
    setTargetColumn(null)
    const id = e.dataTransfer.getData('text/plain') || draggedNegocioId
    setDraggedNegocioId(null)

    if (!id) return
    const negocio = negocios.find((n) => n.id === id)
    if (!negocio || negocio.etapa === novaEtapa) return

    // Optimistic UI update
    setNegocios((prev) => prev.map((n) => (n.id === id ? { ...n, etapa: novaEtapa } : n)))

    try {
      await crmService.updateNegocio(id, { etapa: novaEtapa })
      toast({
        title: 'Etapa atualizada',
        description: `"${negocio.nome}" movido para ${novaEtapa}.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível mover o negócio.',
        variant: 'destructive',
      })
      loadData()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2E5A] tracking-tight font-heading">
            Pipeline Comercial
          </h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Diagnóstico que revela. Benefícios que resolvem. Dados que comprovam o avanço de cada
            oportunidade.
          </p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#1B2E5A] hover:bg-[#132140] text-white font-semibold transition active:scale-[0.98] self-start sm:self-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5 text-[#F58220]" />
          Novo Negócio
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-6">
        {ETAPAS.map((col) => {
          const cards = negocios.filter((n) => n.etapa === col.id)
          const totalValor = cards.reduce((acc, n) => acc + (n.valor || 0), 0)
          const isTarget = targetColumn === col.id

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-xl border bg-white min-h-[500px] transition-all duration-200 ${
                isTarget
                  ? 'border-2 border-dashed border-[#1B2E5A] bg-[#EBF6F8]'
                  : 'border-[#E2E8F0]'
              }`}
            >
              <div
                className="p-3.5 border-b border-[#F1F5F9] rounded-t-xl"
                style={{ borderTop: `4px solid ${col.color}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <h3 className="font-bold text-sm text-[#1E293B]">{col.label}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569]">
                      {cards.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFastCreate(col.id)}
                      className="p-1 rounded-md text-[#94A3B8] hover:text-[#1B2E5A] hover:bg-[#EBF6F8] transition"
                      title="Adicionar negócio rápido nesta etapa"
                    >
                      <Plus className="h-4 w-4" />
                    </button>{' '}
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-[#64748B] mt-1.5">
                  R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>

              <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[700px] custom-scrollbar">
                {cards.map((neg) => {
                  const contaNome = neg.expand?.conta_id?.nome || 'Conta vinculada'
                  const respNome = neg.expand?.responsavel_id?.name || 'Comercial'
                  const isDragging = draggedNegocioId === neg.id

                  return (
                    <div
                      key={neg.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, neg.id)}
                      onClick={() => navigate(`/negocios/${neg.id}`)}
                      className={`group cursor-grab active:cursor-grabbing p-3.5 rounded-xl border border-[#E2E8F0] bg-white shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.01] ${
                        isDragging ? 'opacity-40 scale-105 shadow-xl rotate-1' : ''
                      }`}
                    >
                      <p className="font-bold text-xs text-[#0F172A] leading-snug group-hover:text-[#1B2E5A] transition line-clamp-2">
                        {neg.nome}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 text-xs text-[#475569]">
                        <Building className="h-3.5 w-3.5 text-[#29AABE] shrink-0" />
                        <span className="truncate text-[11px] font-medium">{contaNome}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F8FAFC]">
                        <span className="text-xs font-black text-[#1B2E5A]">
                          R$ {neg.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div
                          title={respNome}
                          className="h-6 w-6 rounded-full bg-[#E2E8F0] text-[#1E293B] font-bold text-[10px] flex items-center justify-center shrink-0"
                        >
                          {respNome[0].toUpperCase()}
                        </div>
                      </div>

                      {neg.previsao_fechamento && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-[#94A3B8]">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Prev: {new Date(neg.previsao_fechamento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {cards.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-lg">
                    Nenhum negócio aqui.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1B2E5A] font-heading">
              Novo Negócio
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNegocio} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="nome-neg" className="text-xs font-semibold text-[#334155]">
                Título da oportunidade *
              </Label>
              <Input
                id="nome-neg"
                required
                placeholder="Ex.: Diagnóstico Psicossocial 500 vidas"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#334155]">
                Conta / Lead Vinculada *
              </Label>
              <Select value={newContaId} onValueChange={setNewContaId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione uma conta..." />
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
                <Label htmlFor="valor-neg" className="text-xs font-semibold text-[#334155]">
                  Valor (R$) *
                </Label>
                <Input
                  id="valor-neg"
                  required
                  placeholder="Ex.: 45000"
                  value={newValor}
                  onChange={(e) => setNewValor(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#334155]">Etapa</Label>
                <Select value={newEtapa} onValueChange={(val) => setNewEtapa(val as EtapaNegocio)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ETAPAS.map((e) => (
                      <SelectItem key={e.id} value={e.id} className="text-xs">
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="prev-fech" className="text-xs font-semibold text-[#334155]">
                Previsão de Fechamento
              </Label>
              <Input
                id="prev-fech"
                type="date"
                value={newPrevisao}
                onChange={(e) => setNewPrevisao(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-neg" className="text-xs font-semibold text-[#334155]">
                Observações
              </Label>
              <Textarea
                id="obs-neg"
                placeholder="Detalhes da proposta, número de colaboradores, dores de absenteísmo..."
                value={newObs}
                onChange={(e) => setNewObs(e.target.value)}
                className="text-xs resize-none"
                rows={3}
              />
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
                {saving ? 'Salvando...' : 'Criar Negócio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
