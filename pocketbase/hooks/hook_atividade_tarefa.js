/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  const record = e.record
  const origem = record.getString('origem')

  if (origem === 'cadencia') {
    const contaId = record.getString('conta_id')
    const responsavelId = record.getString('responsavel_id') || (e.auth ? e.auth.id : '')
    const titulo = record.getString('titulo')

    if (contaId) {
      try {
        const atividadesCol = $app.findCollectionByNameOrId('atividades')
        const atv = new Record(atividadesCol)
        atv.set('tipo', 'tarefa_criada')
        atv.set('descricao', `Tarefa automatizada da cadência gerada: "${titulo}"`)
        atv.set('data_hora', new Date().toISOString())
        atv.set('conta_id', contaId)
        atv.set('usuario_id', responsavelId)
        $app.save(atv)
      } catch (err) {
        console.error('Erro ao registrar atividade de tarefa cadencia:', err)
      }
    }
  }

  e.next()
}, 'tarefas')
