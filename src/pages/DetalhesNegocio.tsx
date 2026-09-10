import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  DollarSign,
  Calendar,
  CheckCircle,
  FileText,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  PhoneCall,
  Mail,
  Users,
  Award,
} from 'lucide-react'
import { crmService } from '@/services/crmService'
import { useAuth } from '@/contexts/AuthContext'
import type { NegocioRecord, AtividadeRecord, DocumentoRecord, EtapaNegocio } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const ETAPAS_ORDEM: EtapaNegocio[] = [
  'Prospecção',
  'Diagnóstico',
  'Proposta',
  'Negociação',
  'Fechamento',
]

export default function DetalhesNegocio() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [negocio, setNegocio] = useState<NegocioRecord | null>(null)
  const [atividades, setAtividades] = useState<AtividadeRecord[]>([])
  const [documentos, setDocumentos] = useState<DocumentoRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Nova Atividade
  const [modalAtvOpen, setModalAtvOpen] = useState(false)
  const [tipoAtv, setTipoAtv] = useState<'call' | 'email' | 'reuniao' | 'observacao'>('call')
  const [descAtv, setDescAtv] = useState('')
  const [savingAtv, setSavingAtv] = useState(false)

  // Upload state
  const [uploading, setUploading] = useState(false)

  const loadData = async () => {
    if (!id) return
    try {
      const neg = await crmService.getNegocioById(id)
      setNegocio(neg)

      if (neg.conta_id) {
        const atvs = await crmService.getAtividades(`conta_id = '${neg.conta_id}'`)
        setAtividades(atvs)
      }
      const docs = await crmService.getDocumentos(id)
      setDocumentos(docs)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Negócio não encontrado',
        description: 'Não foi possível carregar os dados desta oportunidade.',
        variant: 'destructive',
      })
      navigate('/pipeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleAvancarEtapa = async () => {
    if (!negocio) return
    const currentIndex = ETAPAS_ORDEM.indexOf(negocio.etapa)
    if (currentIndex >= ETAPAS_ORDEM.length - 1) {
      toast({
        title: 'Etapa final',
        description: 'Este negócio já atingiu a etapa de Fechamento.',
      })
      return
    }
    const proxima = ETAPAS_ORDEM[currentIndex + 1]
    try {
      await crmService.updateNegocio(negocio.id, { etapa: proxima })
      toast({
        title: 'Etapa avançada!',
        description: `Negócio avançou para ${proxima}.`,
      })
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao avançar etapa',
        variant: 'destructive',
      })
    }
  }

  const handleConverterConta = async () => {
    if (!negocio || !negocio.conta_id) return
    try {
      await crmService.updateConta(negocio.conta_id, { status: 'Fechado' })
      await crmService.updateNegocio(negocio.id, { etapa: 'Fechamento' })
      toast({
        title: 'Conta convertida!',
        description: 'A conta vinculada foi definida como Fechado (cliente ativo).',
      })
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao converter conta',
        variant: 'destructive',
      })
    }
  }

  const handleCreateAtividade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!negocio || !negocio.conta_id || !descAtv.trim()) return

    try {
      setSavingAtv(true)
      await crmService.createAtividade({
        tipo: tipoAtv,
        descricao: descAtv.trim(),
        data_hora: new Date().toISOString(),
        conta_id: negocio.conta_id,
        usuario_id: user?.id,
      })
      toast({
        title: 'Atividade registrada!',
        description: 'Histórico comercial atualizado com sucesso.',
      })
      setDescAtv('')
      setModalAtvOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao registrar atividade',
        variant: 'destructive',
      })
    } finally {
      setSavingAtv(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !negocio) return
    const file = files[0]

    // Limite de 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo não pode exceder 10MB.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('negocio_id', negocio.id)
      formData.append('nome', file.name)
      formData.append('arquivo', file)

      await crmService.uploadDocumento(formData)
      toast({
        title: 'Documento anexado!',
        description: `Arquivo ${file.name} salvo com sucesso.`,
      })
      loadData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao fazer upload',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Deseja realmente remover este documento?')) return
    try {
      await crmService.deleteDocumento(docId)
      toast({ title: 'Documento excluído' })
      loadData()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao excluir documento', variant: 'destructive' })
    }
  }

  if (loading || !negocio) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003882] border-t-transparent" />
      </div>
    )
  }

  const conta = negocio.expand?.conta_id
  const isFechado = negocio.etapa === 'Fechamento'

  return (
    <div className="space-y-6">
      {/* Top Navigation Back */}
      <div className="flex items-center gap-2">
        <Link to="/pipeline">
          <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#003882]">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Voltar para o Pipeline
          </Button>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isFechado ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                Etapa: {negocio.etapa}
              </span>
              {isFechado && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00A859] bg-[#EBF7F0] px-2 py-0.5 rounded-full">
                  <Award className="h-3 w-3" />
                  Negócio Ganho
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">{negocio.nome}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#64748B]">
              {conta && (
                <Link
                  to={`/contas/${conta.id}`}
                  className="flex items-center gap-1.5 hover:text-[#003882] font-semibold underline"
                >
                  <Building className="h-3.5 w-3.5" />
                  {conta.nome}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              {negocio.previsao_fechamento && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Previsão: {new Date(negocio.previsao_fechamento).toLocaleDateString('pt-BR')}
                </span>
              )}
              <span className="font-bold text-[#003882] text-sm">
                R$ {negocio.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isFechado && (
              <Button
                onClick={handleAvancarEtapa}
                className="bg-[#003882] hover:bg-[#00285e] text-white text-xs font-semibold"
              >
                Avançar Etapa
              </Button>
            )}
            <Button
              onClick={handleConverterConta}
              variant="outline"
              className="border-[#00A859] text-[#00A859] hover:bg-[#EBF7F0] text-xs font-semibold"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Converter em Conta (Fechado)
            </Button>
            {conta && (
              <Link to={`/contas/${conta.id}`}>
                <Button variant="outline" className="text-xs text-[#475569]">
                  Visualizar no CRM
                </Button>
              </Link>
            )}
          </div>
        </div>

        {negocio.observacoes && (
          <div className="mt-4 pt-4 border-t border-[#F1F5F9] text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-xl">
            <span className="font-bold text-[#1E293B]">Observações: </span>
            {negocio.observacoes}
          </div>
        )}
      </div>

      {/* Tabs: Atividades e Documentos */}
      <Tabs defaultValue="atividades" className="w-full">
        <TabsList className="bg-white border border-[#E2E8F0] p-1 rounded-xl">
          <TabsTrigger value="atividades" className="text-xs font-semibold">
            Histórico de Atividades ({atividades.length})
          </TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs font-semibold">
            Documentos & Propostas ({documentos.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Atividades */}
        <TabsContent value="atividades" className="mt-4">
          <Card className="rounded-xl border-[#E2E8F0]">
            <CardHeader className="p-5 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-[#0F172A]">
                Histórico Comercial
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setModalAtvOpen(true)}
                className="bg-[#003882] hover:bg-[#00285e] text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Registrar Atividade
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                {atividades.map((atv) => (
                  <div
                    key={atv.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]"
                  >
                    <div className="h-8 w-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#003882] shrink-0">
                      {atv.tipo === 'call' && <PhoneCall className="h-4 w-4" />}
                      {atv.tipo === 'email' && <Mail className="h-4 w-4" />}
                      {atv.tipo === 'reuniao' && <Users className="h-4 w-4" />}
                      {(atv.tipo === 'tarefa_criada' ||
                        atv.tipo === 'negocio_fechado' ||
                        atv.tipo === 'observacao') && (
                        <CheckCircle className="h-4 w-4 text-[#00A859]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                          {atv.tipo.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(atv.data_hora).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-[#1E293B] mt-1">{atv.descricao}</p>
                    </div>
                  </div>
                ))}

                {atividades.length === 0 && (
                  <div className="text-center py-8 text-xs text-[#94A3B8]">
                    Nenhuma atividade registrada ainda para este negócio/conta.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Documentos */}
        <TabsContent value="documentos" className="mt-4">
          <Card className="rounded-xl border-[#E2E8F0]">
            <CardHeader className="p-5 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#0F172A]">
                  Arquivos Anexados
                </CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Propostas comerciais, minutas contratuais e relatórios diagnósticos (máx. 10MB).
                </p>
              </div>
              <div>
                <input
                  type="file"
                  id="doc-file-input"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.xlsx,.xls,.png,.jpg"
                />
                <Button
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById('doc-file-input')?.click()}
                  className="bg-[#003882] hover:bg-[#00285e] text-white text-xs"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {uploading ? 'Enviando...' : 'Anexar Documento'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#003882]" />
                      <div>
                        <p className="text-xs font-bold text-[#1E293B]">{doc.nome}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Enviado em: {new Date(doc.created).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {documentos.length === 0 && (
                  <div className="text-center py-8 text-xs text-[#94A3B8]">
                    Nenhum documento anexado a esta oportunidade.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Registrar Atividade */}
      <Dialog open={modalAtvOpen} onOpenChange={setModalAtvOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#003882]">
              Registrar Atividade de Follow-up
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAtividade} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#334155]">Tipo de contato</Label>
              <Select
                value={tipoAtv}
                onValueChange={(v) => setTipoAtv(v as 'call' | 'email' | 'reuniao' | 'observacao')}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call" className="text-xs">
                    Ligação telefônica
                  </SelectItem>
                  <SelectItem value="email" className="text-xs">
                    E-mail enviado/recebido
                  </SelectItem>
                  <SelectItem value="reuniao" className="text-xs">
                    Reunião presencial ou online
                  </SelectItem>
                  <SelectItem value="observacao" className="text-xs">
                    Anotação interna
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc-atv" className="text-xs font-semibold text-[#334155]">
                Descrição da atividade *
              </Label>
              <Textarea
                id="desc-atv"
                required
                placeholder="Ex.: Reunião com diretora de RH sobre apresentação do diagnóstico NR-1..."
                value={descAtv}
                onChange={(e) => setDescAtv(e.target.value)}
                className="text-xs resize-none"
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalAtvOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingAtv}
                className="bg-[#003882] hover:bg-[#00285e] text-white"
              >
                {savingAtv ? 'Salvando...' : 'Salvar Atividade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
