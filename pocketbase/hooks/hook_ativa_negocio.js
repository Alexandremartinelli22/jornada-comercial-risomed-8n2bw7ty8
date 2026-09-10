/// <reference path="../pb_data/types.d.ts" />

onRecordUpdate((e) => {
  const record = e.record
  const etapa = record.getString('etapa')
  const oldEtapa = record.original() ? record.original().getString('etapa') : ''

  // Se a etapa mudou para "Fechamento"
  if (etapa === 'Fechamento' && oldEtapa !== 'Fechamento') {
    const contaId = record.getString('conta_id')
    const responsavelId = record.getString('responsavel_id') || (e.auth ? e.auth.id : '')
    const valor = record.getFloat('valor')
    const nomeNegocio = record.getString('nome')

    if (contaId) {
      try {
        const conta = $app.findRecordById('contas', contaId)
        conta.set('status', 'Fechado')
        $app.save(conta)

        // Criar registro na coleção de atividades
        const atividadesCol = $app.findCollectionByNameOrId('atividades')
        const atv = new Record(atividadesCol)
        atv.set('tipo', 'negocio_fechado')
        atv.set(
          'descricao',
          `Negócio fechado com sucesso: "${nomeNegocio}" (R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
        )
        atv.set('data_hora', new Date().toISOString())
        atv.set('conta_id', contaId)
        atv.set('usuario_id', responsavelId)
        $app.save(atv)
      } catch (err) {
        console.error('Erro ao atualizar conta para Fechado:', err)
      }
    }
  }

  e.next()
}, 'negocios')
