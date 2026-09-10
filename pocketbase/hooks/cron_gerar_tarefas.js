/// <reference path="../pb_data/types.d.ts" />

// Hook cron a cada 10 min para gerar tarefas da cadência para contas em 'Prospecção'
cronAdd('gerar_tarefas_cadencia', '*/10 * * * *', () => {
  try {
    const cadencias = $app.findRecordsByFilter('cadencias', "status = 'ativa'", '-created', 100, 0)
    const contas = $app.findRecordsByFilter('contas', "status = 'Prospecção'", '-created', 200, 0)

    if (!cadencias || cadencias.length === 0 || !contas || contas.length === 0) {
      return
    }

    const tarefasCol = $app.findCollectionByNameOrId('tarefas')

    for (let c = 0; c < cadencias.length; c++) {
      const cad = cadencias[c]
      const etapas = cad.get('etapas') || []
      if (!Array.isArray(etapas) || etapas.length === 0) continue

      const cadResponsavel = cad.getString('responsavel_id')

      for (let i = 0; i < contas.length; i++) {
        const conta = contas[i]
        const contaId = conta.id
        const responsavelId = conta.getString('responsavel_id') || cadResponsavel
        const contaNome = conta.getString('nome')

        // Buscar tarefas já criadas para essa conta com origem 'cadencia'
        const existingTarefas = $app.findRecordsByFilter(
          'tarefas',
          `conta_id = '${contaId}' && origem = 'cadencia'`,
          'created',
          100,
          0,
        )

        const jaExecutouCount = existingTarefas ? existingTarefas.length : 0
        if (jaExecutouCount < etapas.length) {
          const proximaEtapa = etapas[jaExecutouCount]
          const delayDias = Number(proximaEtapa.delay_dias || 0)

          // Verificar se já existe uma tarefa pendente para esta conta
          const tarefasPendentes = $app.findRecordsByFilter(
            'tarefas',
            `conta_id = '${contaId}' && status = 'pendente'`,
            '-created',
            1,
            0,
          )

          if (tarefasPendentes && tarefasPendentes.length > 0) {
            continue // Já tem tarefa pendente, não sobrecarregar
          }

          // Criar nova tarefa
          const novaTarefa = new Record(tarefasCol)
          const tipo = proximaEtapa.tipo === 'email' ? 'email' : 'call'
          let titulo = proximaEtapa.titulo || `Follow-up: etapa ${jaExecutouCount + 1}`
          titulo = titulo.replace(/\[Nome da Conta\]/g, contaNome)

          let desc = proximaEtapa.corpo || proximaEtapa.descricao || ''
          desc = desc.replace(/\[Nome da Conta\]/g, contaNome)

          const vencimento = new Date()
          vencimento.setDate(vencimento.getDate() + (delayDias || 1))

          novaTarefa.set('titulo', titulo)
          novaTarefa.set('conta_id', contaId)
          novaTarefa.set('tipo', tipo)
          novaTarefa.set('prioridade', 'Média')
          novaTarefa.set('data_vencimento', vencimento.toISOString())
          novaTarefa.set('status', 'pendente')
          novaTarefa.set('responsavel_id', responsavelId)
          novaTarefa.set('descricao', desc)
          novaTarefa.set('origem', 'cadencia')

          $app.save(novaTarefa)
        }
      }
    }
  } catch (err) {
    console.error('Erro no cron gerar_tarefas_cadencia:', err)
  }
})
