import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Phone,
  Globe,
  DollarSign,
  Kanban,
  CheckSquare,
  History,
  Trash2,
  Edit2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { crmService } from '@/services/crmService'
import type { ContaRecord, NegocioRecord, TarefaRecord, AtividadeRecord } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function DetalhesConta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [conta, setConta] = useState<ContaRecord | null>(null)
  const [negocios, setNegocios] = useState<NegocioRecord[]>([])
  const [tarefas, setTarefas] = useState<TarefaRecord[]>([])
  const [atividades, setAtividades] = useState<AtividadeRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    try {
      const c = await crmService.getContaById(id)
      setConta(c)

      const [nData, tData, aData] = await Promise.all([
        crmService.getNegocios(`conta_id = '${id}'`),
        crmService.getTarefas(`conta_id = '${id}'`),
        crmService.getAtividades(`conta_id = '${id}'`),
      ])
      setNegocios(nData)
      setTarefas(tData)
      setAtividades(aData)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Conta não encontrada',
        variant: 'destructive',
      })
      navigate('/contas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleDeleteConta = async () => {
    if (!conta) return
    if (!confirm(`Deseja realmente excluir a conta "${conta.nome}" e seus registros vinculados?`)) {
      return
    }

    try {
      await crmService.deleteConta(conta.id)
      toast({
        title: 'Conta excluída',
        description: 'A conta foi removida do sistema.',
      })
      navigate('/contas')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao excluir conta',
        variant: 'destructive',
      })
    }
  }

  if (loading || !conta) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B2E5A] border-t-[#29AABE]" />
      </div>
    )
  }

  const receitaPotencial = negocios.reduce((acc, n) => acc + (n.valor || 0), 0)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link to="/contas">
          <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#1B2E5A]">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Voltar para Contas
          </Button>
        </Link>
      </div>

      {/* Header da Conta */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#EBF6F8] border border-[#C6E6EC] flex items-center justify-center text-[#1B2E5A] shrink-0">
              <Building2 className="h-6 w-6 text-[#29AABE]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF6F8] text-[#1B2E5A] border border-[#C6E6EC]">
                  {conta.status}
                </span>
                <span className="text-xs text-[#64748B] font-medium">
                  Porte: {conta.tamanho || 'Médio'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#1B2E5A] tracking-tight font-heading">
                {conta.nome}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#64748B]">
                {conta.cnpj && <span>CNPJ: {conta.cnpj}</span>}
                {conta.setor && <span>• Setor: {conta.setor}</span>}
                {conta.telefone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#29AABE]" />
                    {conta.telefone}
                  </span>
                )}
                {conta.site && (
                  <a
                    href={conta.site}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#1B2E5A] hover:text-[#29AABE] hover:underline font-medium"
                  >
                    <Globe className="h-3 w-3" />
                    Site
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteConta}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visao_geral" className="w-full">
        <TabsList className="bg-white border border-[#E2E8F0] p-1 rounded-xl">
          <TabsTrigger value="visao_geral" className="text-xs font-semibold">
            Visão Geral & Cadastro
          </TabsTrigger>
          <TabsTrigger value="negocios" className="text-xs font-semibold">
            Negócios ({negocios.length})
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="text-xs font-semibold">
            Tarefas ({tarefas.length})
          </TabsTrigger>
          <TabsTrigger value="atividades" className="text-xs font-semibold">
            Histórico ({atividades.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visão Geral */}
        <TabsContent value="visao_geral" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-xl border-[#E2E8F0]">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-semibold text-[#64748B] uppercase">
                  Receita em Negócios
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black text-[#1B2E5A]">
                  R$ {receitaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  {negocios.length} oportunidade(s) ativa(s)
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-[#E2E8F0]">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-semibold text-[#64748B] uppercase">
                  Tarefas Pendentes
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black text-[#F58220]">
                  {tarefas.filter((t) => t.status === 'pendente').length}
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">Follow-ups em andamento</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-[#E2E8F0]">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-semibold text-[#64748B] uppercase">
                  Responsável Comercial
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-base font-bold text-[#1E293B]">
                  {conta.expand?.responsavel_id?.name || 'Equipe Risomed'}
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  {conta.expand?.responsavel_id?.email}
                </p>
              </CardContent>
            </Card>
          </div>

          {conta.descricao_embedded && (
            <Card className="rounded-xl border-[#E2E8F0]">
              <CardHeader className="p-5 border-b border-[#F1F5F9]">
                <CardTitle className="text-sm font-bold text-[#1E293B]">
                  Contexto Estratégico & Dores de Saúde Corporativa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-xs text-[#475569] leading-relaxed">
                {conta.descricao_embedded}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Negócios */}
        <TabsContent value="negocios" className="mt-4">
          <Card className="rounded-xl border-[#E2E8F0]">
            <CardHeader className="p-5 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-[#0F172A]">
                Oportunidades Comerciais
              </CardTitle>
              <Link to="/pipeline">
                <Button
                  size="sm"
                  className="bg-[#1B2E5A] hover:bg-[#132140] text-white text-xs font-semibold shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1 text-[#F58220]" />
                  Ir ao Pipeline
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {negocios.map((n) => (
                <div
                  key={n.id}
                  onClick={() => navigate(`/negocios/${n.id}`)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#29AABE] hover:bg-[#F8FAFC] cursor-pointer transition"
                >
                  <div>
                    <p className="font-bold text-sm text-[#0F172A]">{n.nome}</p>
                    <span className="text-[11px] font-semibold text-[#1B2E5A]">
                      Etapa: {n.etapa}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-sm text-[#1B2E5A]">
                      R$ {n.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {n.previsao_fechamento && (
                      <p className="text-[10px] text-[#94A3B8]">
                        Prev: {new Date(n.previsao_fechamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {negocios.length === 0 && (
                <div className="py-8 text-center text-xs text-[#94A3B8]">
                  Nenhum negócio criado para esta conta.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Tarefas */}
        <TabsContent value="tarefas" className="mt-4">
          <Card className="rounded-xl border-[#E2E8F0]">
            <CardHeader className="p-5 border-b border-[#F1F5F9]">
              <CardTitle className="text-base font-bold text-[#0F172A]">
                Tarefas Vinculadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5">
              {tarefas.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white"
                >
                  <div>
                    <p
                      className={`text-xs font-bold ${t.status === 'concluida' ? 'line-through text-[#94A3B8]' : 'text-[#1E293B]'}`}
                    >
                      {t.titulo}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Vencimento: {new Date(t.data_vencimento).toLocaleDateString('pt-BR')} •
                      Origem: {t.origem}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'concluida'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}

              {tarefas.length === 0 && (
                <div className="py-8 text-center text-xs text-[#94A3B8]">
                  Nenhuma tarefa vinculada a esta conta.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Atividades */}
        <TabsContent value="atividades" className="mt-4">
          <Card className="rounded-xl border-[#E2E8F0]">
            <CardHeader className="p-5 border-b border-[#F1F5F9]">
              <CardTitle className="text-base font-bold text-[#0F172A]">
                Histórico de Contatos e Interações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {atividades.map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-[#F1F5F9] bg-[#F8FAFC]">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="font-bold uppercase tracking-wider">
                      {a.tipo.replace('_', ' ')}
                    </span>
                    <span>{new Date(a.data_hora).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-xs text-[#1E293B] mt-1">{a.descricao}</p>
                </div>
              ))}

              {atividades.length === 0 && (
                <div className="py-8 text-center text-xs text-[#94A3B8]">
                  Nenhum registro de atividade para esta conta.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
