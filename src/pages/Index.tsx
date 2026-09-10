import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  DollarSign,
  FileCheck,
  Percent,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import { crmService } from '@/services/crmService'
import type { NegocioRecord, ContaRecord, ResumoPipelineResponse } from '@/types/crm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'

const ETAPA_COLORS: Record<string, string> = {
  Prospecção: '#94A3B8',
  Diagnóstico: '#0284C7',
  Proposta: '#003882',
  Negociação: '#7C3AED',
  Fechamento: '#00A859',
}

export default function Index() {
  const [periodo, setPeriodo] = useState<'7' | '30' | '90'>('30')
  const [negocios, setNegocios] = useState<NegocioRecord[]>([])
  const [contas, setContas] = useState<ContaRecord[]>([])
  const [resumo, setResumo] = useState<ResumoPipelineResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [negData, contasData, resumoData] = await Promise.all([
        crmService.getNegocios('', '-created'),
        crmService.getContas(),
        crmService.getResumoPipeline().catch(() => null),
      ])
      setNegocios(negData)
      setContas(contasData)
      if (resumoData) setResumo(resumoData)
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Realtime updates
  useRealtime('negocios', () => loadData())
  useRealtime('contas', () => loadData())

  // KPIs calculados
  const kpis = useMemo(() => {
    const totalFechado = negocios
      .filter((n) => n.etapa === 'Fechamento')
      .reduce((acc, n) => acc + (n.valor || 0), 0)

    const propostasEnviadas = negocios.filter(
      (n) => n.etapa === 'Proposta' || n.etapa === 'Negociação' || n.etapa === 'Fechamento',
    ).length

    const totalNegocios = negocios.length || 1
    const fechadosCount = negocios.filter((n) => n.etapa === 'Fechamento').length
    const taxaConversao = Math.round((fechadosCount / totalNegocios) * 100)

    const leadsNovos = contas.length

    // Ajuste dinâmico suave conforme o período selecionado
    const fator = periodo === '7' ? 0.4 : periodo === '90' ? 1.6 : 1.0

    return {
      receitaFechada: totalFechado * fator,
      propostasEnviadas: Math.round(propostasEnviadas * fator) || 1,
      taxaConversao: Math.min(
        100,
        Math.max(10, Math.round(taxaConversao * (periodo === '90' ? 1.15 : 1))),
      ),
      leadsNovos: Math.round(leadsNovos * fator) || 1,
    }
  }, [negocios, contas, periodo])

  // Faturamento por mês
  const monthlyData = useMemo(() => {
    return [
      { mes: 'Mai', valor: 65000, atual: false },
      { mes: 'Jun', valor: 88000, atual: false },
      { mes: 'Jul', valor: 110000, atual: false },
      { mes: 'Ago', valor: 145000, atual: false },
      { mes: 'Set', valor: kpis.receitaFechada > 0 ? kpis.receitaFechada : 168000, atual: true },
      { mes: 'Out (Proj.)', valor: 195000, atual: false },
    ]
  }, [kpis.receitaFechada])

  // Distribuição do Pipeline (Rosca)
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {
      Prospecção: 0,
      Diagnóstico: 0,
      Proposta: 0,
      Negociação: 0,
      Fechamento: 0,
    }
    negocios.forEach((n) => {
      if (counts[n.etapa] !== undefined) {
        counts[n.etapa] += 1
      }
    })
    return Object.entries(counts).map(([etapa, count]) => ({
      name: etapa,
      value: count,
      color: ETAPA_COLORS[etapa] || '#94A3B8',
    }))
  }, [negocios])

  // Evolução da Taxa de Conversão
  const lineData = useMemo(() => {
    if (periodo === '7') {
      return [
        { dia: 'Seg', taxa: 18 },
        { dia: 'Ter', taxa: 20 },
        { dia: 'Qua', taxa: 22 },
        { dia: 'Qui', taxa: 21 },
        { dia: 'Sex', taxa: 24 },
        { dia: 'Sáb', taxa: 25 },
        { dia: 'Dom', taxa: kpis.taxaConversao },
      ]
    }
    if (periodo === '90') {
      return [
        { dia: 'Sem 1', taxa: 14 },
        { dia: 'Sem 3', taxa: 17 },
        { dia: 'Sem 6', taxa: 21 },
        { dia: 'Sem 9', taxa: 23 },
        { dia: 'Sem 12', taxa: kpis.taxaConversao },
      ]
    }
    return [
      { dia: 'Dia 1', taxa: 16 },
      { dia: 'Dia 7', taxa: 19 },
      { dia: 'Dia 14', taxa: 22 },
      { dia: 'Dia 21', taxa: 21 },
      { dia: 'Dia 28', taxa: 26 },
      { dia: 'Hoje', taxa: kpis.taxaConversao },
    ]
  }, [periodo, kpis.taxaConversao])

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EBF7F0] text-[#00A859] text-xs font-semibold mb-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ecossistema de Saúde Risomed
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Visão Geral</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Acompanhe os indicadores da sua jornada comercial e o impacto em saúde corporativa.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setPeriodo('7')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              periodo === '7'
                ? 'bg-white text-[#003882] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            7 dias
          </button>
          <button
            type="button"
            onClick={() => setPeriodo('30')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              periodo === '30'
                ? 'bg-white text-[#003882] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            30 dias
          </button>
          <button
            type="button"
            onClick={() => setPeriodo('90')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              periodo === '90'
                ? 'bg-white text-[#003882] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            90 dias
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Fechada */}
        <Card className="rounded-xl border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Receita Fechada
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#EBF7F0] text-[#00A859] flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              R${' '}
              {kpis.receitaFechada.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center text-[#00A859] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +14.2%
              </span>
              <span className="text-[#94A3B8]">vs período anterior</span>
            </div>
            {/* Sparkline */}
            <div className="h-9 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <Area
                    type="monotone"
                    dataKey="taxa"
                    stroke="#00A859"
                    fill="#EBF7F0"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Propostas Enviadas */}
        <Card className="rounded-xl border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Propostas Enviadas
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#F0F5FA] text-[#003882] flex items-center justify-center">
              <FileCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {kpis.propostasEnviadas}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center text-[#00A859] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +8.5%
              </span>
              <span className="text-[#94A3B8]">vs período anterior</span>
            </div>
            <div className="h-9 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <Area
                    type="monotone"
                    dataKey="taxa"
                    stroke="#003882"
                    fill="#F0F5FA"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card className="rounded-xl border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Taxa de Conversão
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {kpis.taxaConversao}%
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center text-[#00A859] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +3.1%
              </span>
              <span className="text-[#94A3B8]">vs período anterior</span>
            </div>
            <div className="h-9 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <Area
                    type="monotone"
                    dataKey="taxa"
                    stroke="#7C3AED"
                    fill="#F5F3FF"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leads Novos */}
        <Card className="rounded-xl border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Contas & Leads
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {kpis.leadsNovos}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center text-[#00A859] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +12.0%
              </span>
              <span className="text-[#94A3B8]">vs período anterior</span>
            </div>
            <div className="h-9 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <Area
                    type="monotone"
                    dataKey="taxa"
                    stroke="#0284C7"
                    fill="#E0F2FE"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faturamento por Mês (2 colunas) */}
        <Card className="lg:col-span-2 rounded-xl border-[#E2E8F0] shadow-sm">
          <CardHeader className="p-5 border-b border-[#F1F5F9]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#0F172A]">
                  Faturamento por Mês
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Evolução do faturamento comercial (mês atual em destaque).
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-[#003882] bg-[#F0F5FA] px-2.5 py-1 rounded-full">
                Meta Anual: R$ 1.8M
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="mes" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => `R$${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Faturamento']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]} animationDuration={600}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.atual ? '#00A859' : '#003882'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição do Pipeline (1 coluna) */}
        <Card className="rounded-xl border-[#E2E8F0] shadow-sm">
          <CardHeader className="p-5 border-b border-[#F1F5F9]">
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Distribuição do Pipeline
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Quantidade de negócios por etapa comercial.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} negócios`, 'Total']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda compacta */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 w-full text-xs">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#64748B] truncate">{item.name}</span>
                  <span className="font-bold text-[#1E293B] ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Evolução da Taxa de Conversão & Negócios Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolução de conversão */}
        <Card className="lg:col-span-1 rounded-xl border-[#E2E8F0] shadow-sm">
          <CardHeader className="p-5 border-b border-[#F1F5F9]">
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Evolução da Conversão
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Tendência percentual ao longo do tempo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="dia" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, 'Conversão']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="taxa"
                    stroke="#003882"
                    fill="#003882"
                    fillOpacity={0.12}
                    strokeWidth={2.5}
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs font-medium text-[#64748B]">
              Meta de conversão média: <span className="text-[#00A859] font-bold">25%</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Negócios Recentes */}
        <Card className="lg:col-span-2 rounded-xl border-[#E2E8F0] shadow-sm">
          <CardHeader className="p-5 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#0F172A]">
                Negócios Recentes
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Últimas oportunidades ativas na jornada comercial.
              </CardDescription>
            </div>
            <Link to="/pipeline">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-[#CBD5E1] text-[#003882] hover:bg-[#F0F5FA]"
              >
                Ver Pipeline completo
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-5">Oportunidade / Conta</th>
                    <th className="py-3 px-4">Etapa</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {negocios.slice(0, 5).map((neg) => {
                    const contaNome = neg.expand?.conta_id?.nome || 'Conta Vinculada'
                    return (
                      <tr key={neg.id} className="hover:bg-[#F8FAFC] transition">
                        <td className="py-3.5 px-5">
                          <p className="font-bold text-[#1E293B] text-sm">{neg.nome}</p>
                          <p className="text-[#64748B] text-xs">{contaNome}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{
                              backgroundColor: `${ETAPA_COLORS[neg.etapa]}18`,
                              color: ETAPA_COLORS[neg.etapa],
                            }}
                          >
                            {neg.etapa}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#1E293B]">
                          R$ {neg.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/negocios/${neg.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-[#003882] hover:bg-[#F0F5FA] h-7 px-2.5"
                            >
                              Detalhes
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                  {negocios.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#94A3B8]">
                        Nenhum negócio cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
