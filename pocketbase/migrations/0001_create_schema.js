/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. contas
    const contas = new Collection({
      name: 'contas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true, max: 120 },
        { name: 'cnpj', type: 'text', required: false, max: 20 },
        { name: 'setor', type: 'text', required: false },
        {
          name: 'tamanho',
          type: 'select',
          required: false,
          values: ['Pequeno', 'Médio', 'Grande'],
          maxSelect: 1,
        },
        { name: 'site', type: 'url', required: false },
        { name: 'telefone', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Prospecção', 'Diagnóstico', 'Proposta', 'Negociação', 'Fechado'],
          maxSelect: 1,
        },
        {
          name: 'responsavel_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'descricao_embedded', type: 'text', required: false },
        { name: 'buscar_embedding', type: 'vector', required: false, dimensions: 1536 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_contas_status ON contas (status)',
        'CREATE INDEX idx_contas_responsavel ON contas (responsavel_id)',
      ],
    })
    app.save(contas)

    // 2. negocios
    const negocios = new Collection({
      name: 'negocios',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        {
          name: 'conta_id',
          type: 'relation',
          required: true,
          collectionId: contas.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'valor', type: 'number', required: true },
        {
          name: 'etapa',
          type: 'select',
          required: true,
          values: ['Prospecção', 'Diagnóstico', 'Proposta', 'Negociação', 'Fechamento'],
          maxSelect: 1,
        },
        { name: 'previsao_fechamento', type: 'date', required: false },
        {
          name: 'responsavel_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'observacoes', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_negocios_etapa ON negocios (etapa)',
        'CREATE INDEX idx_negocios_conta ON negocios (conta_id)',
        'CREATE INDEX idx_negocios_responsavel ON negocios (responsavel_id)',
      ],
    })
    app.save(negocios)

    // 3. tarefas
    const tarefas = new Collection({
      name: 'tarefas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'titulo', type: 'text', required: true },
        {
          name: 'conta_id',
          type: 'relation',
          required: true,
          collectionId: contas.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['call', 'email', 'reuniao'],
          maxSelect: 1,
        },
        {
          name: 'prioridade',
          type: 'select',
          required: true,
          values: ['Alta', 'Média', 'Baixa'],
          maxSelect: 1,
        },
        { name: 'data_vencimento', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'concluida'],
          maxSelect: 1,
        },
        {
          name: 'responsavel_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: false },
        {
          name: 'origem',
          type: 'select',
          required: true,
          values: ['manual', 'cadencia'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tarefas_status ON tarefas (status)',
        'CREATE INDEX idx_tarefas_vencimento ON tarefas (data_vencimento)',
        'CREATE INDEX idx_tarefas_conta ON tarefas (conta_id)',
        'CREATE INDEX idx_tarefas_responsavel ON tarefas (responsavel_id)',
      ],
    })
    app.save(tarefas)

    // 4. atividades
    const atividades = new Collection({
      name: 'atividades',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['call', 'email', 'reuniao', 'tarefa_criada', 'negocio_fechado', 'observacao'],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'data_hora', type: 'date', required: true },
        {
          name: 'conta_id',
          type: 'relation',
          required: true,
          collectionId: contas.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_atividades_conta ON atividades (conta_id)',
        'CREATE INDEX idx_atividades_data ON atividades (data_hora)',
      ],
    })
    app.save(atividades)

    // 5. cadencias
    const cadencias = new Collection({
      name: 'cadencias',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: false },
        { name: 'etapas', type: 'json', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativa', 'pausada'],
          maxSelect: 1,
        },
        {
          name: 'responsavel_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_cadencias_status ON cadencias (status)'],
    })
    app.save(cadencias)

    // 6. documentos
    const documentos = new Collection({
      name: 'documentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'negocio_id',
          type: 'relation',
          required: true,
          collectionId: negocios.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'arquivo', type: 'file', required: false, maxSelect: 5, maxSize: 10485760 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_documentos_negocio ON documentos (negocio_id)'],
    })
    app.save(documentos)
  },
  (app) => {
    const toDelete = ['documentos', 'cadencias', 'atividades', 'tarefas', 'negocios', 'contas']
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
