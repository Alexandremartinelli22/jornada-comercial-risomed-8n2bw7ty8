import { useEffect, useMemo, useState } from 'react'
import { Download, ListChecks, Plus, Search, Trash2 } from 'lucide-react'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { filaService } from '@/services/crmService'
import type { FilaEstagio, FilaLeadRecord, FilaTagIcp } from '@/types/fila'

const ESTAGIOS: FilaEstagio[] = [
  'Prospecção',
  'Contato',
  'Apresentação',
  'Proposta',
  'Fechamento',
  'Perdido',
]
const TAGS: FilaTagIcp[] = ['ICP Principal', 'Fora ICP', 'Incompleto']
const emptyForm = {
  data_origem: new Date().toISOString().slice(0, 10),
  empresa: '',
  solicitante: '',
  email: '',
  telefone: '',
  cnpj: '',
  vidas: '',
  cidade: '',
  origem: '',
  tag_icp: 'Incompleto' as FilaTagIcp,
  estagio: 'Prospecção' as FilaEstagio,
  resultado_contato: '',
  proxima_acao: '',
  data_proxima_acao: new Date().toISOString().slice(0, 10),
  motivo_perda: '',
}

function csvEscape(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export default function FilaManual() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leads, setLeads] = useState<FilaLeadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('todos')
  const [tagFilter, setTagFilter] = useState('todos')
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    try {
      setLeads(await filaService.getLeads())
    } catch (error) {
      console.error(error)
      toast({ title: 'Não foi possível carregar a fila', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () =>
      leads.filter((lead) => {
        const q = search.toLowerCase()
        const matchesSearch =
          !q ||
          [lead.empresa, lead.solicitante, lead.email, lead.cnpj, lead.cidade].some((v) =>
            String(v || '')
              .toLowerCase()
              .includes(q),
          )
        return (
          matchesSearch &&
          (stageFilter === 'todos' || lead.estagio === stageFilter) &&
          (tagFilter === 'todos' || lead.tag_icp === tagFilter)
        )
      }),
    [leads, search, stageFilter, tagFilter],
  )

  const setField = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  const createLead = async (event: React.FormEvent) => {
    event.preventDefault()
    if (
      !user?.id ||
      !form.empresa.trim() ||
      !form.solicitante.trim() ||
      !form.origem.trim() ||
      !form.proxima_acao.trim() ||
      !form.data_origem ||
      !form.data_proxima_acao
    ) {
      toast({
        title: 'Preencha os campos obrigatórios',
        description:
          'Origem, empresa, solicitante, origem do lead e próxima ação são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    if (form.estagio === 'Perdido' && !form.motivo_perda.trim()) {
      toast({
        title: 'Motivo da perda obrigatório',
        description: 'Um lead Perdido precisa ter o motivo registrado.',
        variant: 'destructive',
      })
      return
    }
    try {
      setSaving(true)
      await filaService.createLead({
        ...form,
        vidas: form.vidas ? Number(form.vidas) : undefined,
        created_by: user.id,
      })
      toast({
        title: 'Lead registrado na fila',
        description: 'A próxima ação foi salva com a data definida.',
      })
      setModalOpen(false)
      setForm(emptyForm)
      await load()
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao registrar lead', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const removeLead = async (lead: FilaLeadRecord) => {
    if (!confirm(`Excluir o registro de ${lead.empresa}? Esta ação não pode ser desfeita.`)) return
    try {
      await filaService.deleteLead(lead.id)
      await load()
      toast({ title: 'Registro excluído' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao excluir registro', variant: 'destructive' })
    }
  }

  const exportCsv = () => {
    const headers = [
      'Data de origem',
      'Empresa',
      'Solicitante',
      'E-mail',
      'Telefone',
      'CNPJ',
      'Vidas',
      'Cidade',
      'Origem',
      'Tag ICP',
      'Estágio',
      'Resultado',
      'Próxima ação',
      'Data da próxima ação',
      'Motivo da perda',
    ]
    const rows = filtered.map((l) => [
      l.data_origem,
      l.empresa,
      l.solicitante,
      l.email,
      l.telefone,
      l.cnpj,
      l.vidas,
      l.cidade,
      l.origem,
      l.tag_icp,
      l.estagio,
      l.resultado_contato,
      l.proxima_acao,
      l.data_proxima_acao,
      l.motivo_perda,
    ])
    const csv = '\ufeff' + [headers, ...rows].map((row) => row.map(csvEscape).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `fila-manual-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-[#1B2E5A]" />
            <h2 className="text-2xl font-bold text-[#1B2E5A] font-heading">Fila Manual de Leads</h2>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Comece pequeno. Comprove o valor. Depois escale a prospecção da sua carteira.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={!filtered.length}
            className="hover:border-[#29AABE]"
          >
            <Download className="mr-1.5 h-4 w-4 text-[#29AABE]" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => {
              setForm(emptyForm)
              setModalOpen(true)
            }}
            className="bg-[#1B2E5A] hover:bg-[#132140] text-white font-semibold shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4 text-[#F58220]" />
            Novo lead
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
          <Input
            className="pl-9"
            placeholder="Buscar empresa, solicitante, e-mail, CNPJ ou cidade"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estágio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estágios</SelectItem>
            {ESTAGIOS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tag ICP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as tags</SelectItem>
            {TAGS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-xs">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] uppercase text-[#64748B]">
              <tr>
                {[
                  'Origem',
                  'Empresa / contato',
                  'Vidas / cidade',
                  'Tag ICP',
                  'Estágio',
                  'Próxima ação',
                  'Ações',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    Carregando fila...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#334155]">
                        {new Date(lead.data_origem).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-[#94A3B8]">{lead.origem}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#0F172A]">{lead.empresa}</div>
                      <div className="text-[#64748B]">
                        {lead.solicitante} {lead.email && `• ${lead.email}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#475569]">
                      {lead.vidas ?? '—'}
                      <div className="text-[#94A3B8]">{lead.cidade || 'Cidade não informada'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${lead.tag_icp === 'ICP Principal' ? 'bg-emerald-100 text-emerald-800' : lead.tag_icp === 'Fora ICP' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {lead.tag_icp}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1B2E5A]">{lead.estagio}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#334155]">{lead.proxima_acao}</div>
                      <div className="text-[#64748B]">
                        até {new Date(lead.data_proxima_acao).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${lead.empresa}`}
                        onClick={() => removeLead(lead)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1B2E5A] font-heading">
              Registrar lead na fila
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={createLead} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Data de origem *</Label>
              <Input
                type="date"
                value={form.data_origem}
                onChange={(e) => setField('data_origem', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Origem do lead *</Label>
              <Input
                placeholder="Formulário, indicação..."
                value={form.origem}
                onChange={(e) => setField('origem', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Empresa *</Label>
              <Input
                value={form.empresa}
                onChange={(e) => setField('empresa', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Solicitante *</Label>
              <Input
                value={form.solicitante}
                onChange={(e) => setField('solicitante', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setField('telefone', e.target.value)} />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={(e) => setField('cnpj', e.target.value)} />
            </div>
            <div>
              <Label>Nº de vidas</Label>
              <Input
                type="number"
                min="0"
                value={form.vidas}
                onChange={(e) => setField('vidas', e.target.value)}
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setField('cidade', e.target.value)} />
            </div>
            <div>
              <Label>Tag ICP *</Label>
              <Select value={form.tag_icp} onValueChange={(v) => setField('tag_icp', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAGS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estágio *</Label>
              <Select value={form.estagio} onValueChange={(v) => setField('estagio', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTAGIOS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data da próxima ação *</Label>
              <Input
                type="date"
                value={form.data_proxima_acao}
                onChange={(e) => setField('data_proxima_acao', e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Próxima ação *</Label>
              <Input
                placeholder="Ex.: ligar para o RH"
                value={form.proxima_acao}
                onChange={(e) => setField('proxima_acao', e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Resultado do contato</Label>
              <Textarea
                value={form.resultado_contato}
                onChange={(e) => setField('resultado_contato', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Motivo da perda {form.estagio === 'Perdido' ? '*' : ''}</Label>
              <Input
                value={form.motivo_perda}
                onChange={(e) => setField('motivo_perda', e.target.value)}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1B2E5A] hover:bg-[#132140] text-white font-semibold"
              >
                {saving ? 'Salvando...' : 'Salvar lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
