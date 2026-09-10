/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  'GET',
  '/backend/v1/resumo-pipeline',
  (e) => {
    try {
      const etapas = ['Prospecção', 'Diagnóstico', 'Proposta', 'Negociação', 'Fechamento']
      const etapasMap = {
        Prospecção: { total: 0, valor: 0 },
        Diagnóstico: { total: 0, valor: 0 },
        Proposta: { total: 0, valor: 0 },
        Negociação: { total: 0, valor: 0 },
        Fechamento: { total: 0, valor: 0 },
      }

      const negocios = $app.findRecordsByFilter('negocios', '', '-created', 1000, 0)

      let totalNegocios = 0
      let valorTotal = 0
      let valorFechado = 0

      for (let i = 0; i < negocios.length; i++) {
        const n = negocios[i]
        const etapa = n.getString('etapa')
        const val = n.getFloat('valor') || 0

        if (etapasMap[etapa]) {
          etapasMap[etapa].total += 1
          etapasMap[etapa].valor += val
        }

        totalNegocios += 1
        valorTotal += val
        if (etapa === 'Fechamento') {
          valorFechado += val
        }
      }

      const totalContas = $app.countRecords('contas')
      const totalTarefasPendentes = $app.countRecords('tarefas', "status = 'pendente'")

      return e.json(200, {
        etapas: etapas.map((nome) => ({
          etapa: nome,
          total: etapasMap[nome].total,
          valor: etapasMap[nome].valor,
        })),
        total_negocios: totalNegocios,
        valor_total: valorTotal,
        valor_fechado: valorFechado,
        total_contas: totalContas,
        tarefas_pendentes: totalTarefasPendentes,
      })
    } catch (err) {
      console.error('Erro em /backend/v1/resumo-pipeline:', err)
      return e.json(500, { error: 'Falha ao gerar resumo do pipeline' })
    }
  },
  $apis.requireAuth(),
)
