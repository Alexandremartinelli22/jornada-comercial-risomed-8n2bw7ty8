/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const fila = new Collection({
      name: 'fila_leads',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'data_origem', type: 'date', required: true },
        { name: 'empresa', type: 'text', required: true, max: 160 },
        { name: 'solicitante', type: 'text', required: true, max: 120 },
        { name: 'email', type: 'email', required: false },
        { name: 'telefone', type: 'text', required: false, max: 40 },
        { name: 'cnpj', type: 'text', required: false, max: 20 },
        { name: 'vidas', type: 'number', required: false, min: 0 },
        { name: 'cidade', type: 'text', required: false, max: 120 },
        { name: 'origem', type: 'text', required: true, max: 80 },
        {
          name: 'tag_icp',
          type: 'select',
          required: true,
          values: ['ICP Principal', 'Fora ICP', 'Incompleto'],
          maxSelect: 1,
        },
        {
          name: 'estagio',
          type: 'select',
          required: true,
          values: ['Prospecção', 'Contato', 'Apresentação', 'Proposta', 'Fechamento', 'Perdido'],
          maxSelect: 1,
        },
        { name: 'resultado_contato', type: 'text', required: false, max: 2000 },
        { name: 'proxima_acao', type: 'text', required: true, max: 500 },
        { name: 'data_proxima_acao', type: 'date', required: true },
        { name: 'motivo_perda', type: 'text', required: false, max: 500 },
        {
          name: 'created_by',
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
        'CREATE INDEX idx_fila_leads_origem ON fila_leads (data_origem)',
        'CREATE INDEX idx_fila_leads_estagio ON fila_leads (estagio)',
        'CREATE INDEX idx_fila_leads_tag ON fila_leads (tag_icp)',
      ],
    })
    app.save(fila)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('fila_leads'))
    } catch (_) {}
  },
)
