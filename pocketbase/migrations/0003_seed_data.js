/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Seed or get admin user
    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'alexandre@armodonto.com')
    } catch (_) {
      adminUser = new Record(users)
      adminUser.setEmail('alexandre@armodonto.com')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Alexandre Risomed')
      app.save(adminUser)
    }

    const userId = adminUser.id

    const contasCol = app.findCollectionByNameOrId('contas')
    const negociosCol = app.findCollectionByNameOrId('negocios')
    const tarefasCol = app.findCollectionByNameOrId('tarefas')
    const atividadesCol = app.findCollectionByNameOrId('atividades')
    const cadenciasCol = app.findCollectionByNameOrId('cadencias')

    // 2. Seed Contas
    const contasSeed = [
      {
        nome: 'Hospital e Maternidade São Lucas',
        cnpj: '12.345.678/0001-90',
        setor: 'Saúde e Hospitais',
        tamanho: 'Grande',
        site: 'https://saolucas.example.com',
        telefone: '(11) 3214-5500',
        status: 'Proposta',
        descricao_embedded:
          'Hospital privado com 1.200 colaboradores buscando reduzir absenteísmo de enfermagem com diagnóstico NR-1 e Pronto Socorro Digital.',
      },
      {
        nome: 'TecnoLogística Log Express',
        cnpj: '23.456.789/0001-01',
        setor: 'Logística e Transportes',
        tamanho: 'Médio',
        site: 'https://logexpress.example.com',
        telefone: '(11) 4589-2211',
        status: 'Diagnóstico',
        descricao_embedded:
          'Empresa logística com 450 motoristas e operadores. Alto índice de afastamento por causas osteomusculares e estresse.',
      },
      {
        nome: 'FinTech Nexus Soluções',
        cnpj: '34.567.890/0001-12',
        setor: 'Tecnologia e Serviços Financeiros',
        tamanho: 'Médio',
        site: 'https://nexussolucoes.example.com',
        telefone: '(11) 5090-8800',
        status: 'Negociação',
        descricao_embedded:
          'Startup financeira em expansão rápida, 380 desenvolvedores em regime híbrido buscando telemedicina e apoio à saúde mental.',
      },
      {
        nome: 'Indústria Metalmecânica Aliança',
        cnpj: '45.678.901/0001-23',
        setor: 'Indústria de Manufatura',
        tamanho: 'Grande',
        site: 'https://aliancametal.example.com',
        telefone: '(19) 3881-4400',
        status: 'Prospecção',
        descricao_embedded:
          'Parque fabril com 850 operadores de fábrica. Desafio em conformidade com riscos psicossociais da nova NR-1.',
      },
      {
        nome: 'Grupo Varejo Mais Brasil',
        cnpj: '56.789.012/0001-34',
        setor: 'Comércio Varejista',
        tamanho: 'Grande',
        site: 'https://varejomais.example.com',
        telefone: '(11) 2334-9988',
        status: 'Fechado',
        descricao_embedded:
          'Rede varejista com 2.100 funcionários contratou plano integrado Risomed: odonto + telemedicina + diagnóstico semestral.',
      },
    ]

    const createdContas = {}
    for (const c of contasSeed) {
      let rec
      try {
        rec = app.findFirstRecordByData('contas', 'nome', c.nome)
      } catch (_) {
        rec = new Record(contasCol)
        rec.set('nome', c.nome)
        rec.set('cnpj', c.cnpj)
        rec.set('setor', c.setor)
        rec.set('tamanho', c.tamanho)
        rec.set('site', c.site)
        rec.set('telefone', c.telefone)
        rec.set('status', c.status)
        rec.set('responsavel_id', userId)
        rec.set('descricao_embedded', c.descricao_embedded)
        app.save(rec)
      }
      createdContas[c.nome] = rec
    }

    // 3. Seed Negócios
    const negociosSeed = [
      {
        nome: 'Implantação Ecossistema Risomed - São Lucas',
        contaNome: 'Hospital e Maternidade São Lucas',
        valor: 84000,
        etapa: 'Proposta',
        previsao: '2026-10-15 18:00:00.000Z',
        obs: 'Proposta enviada para 1.200 vidas. Inclui Pronto Socorro Digital + Odonto + Diagnóstico NR-1.',
      },
      {
        nome: 'Piloto Diagnóstico Psicossocial - Log Express',
        contaNome: 'TecnoLogística Log Express',
        valor: 28500,
        etapa: 'Diagnóstico',
        previsao: '2026-09-30 18:00:00.000Z',
        obs: 'Apresentação do mapeamento psicossocial em andamento com o diretor de RH.',
      },
      {
        nome: 'Contrato Anual Saúde Integrada - Nexus',
        contaNome: 'FinTech Nexus Soluções',
        valor: 54000,
        etapa: 'Negociação',
        previsao: '2026-09-22 18:00:00.000Z',
        obs: 'Reunião final com comitê de pessoas para validação de minuta contratual sem carência.',
      },
      {
        nome: 'Diagnóstico NR-1 Preliminar - Aliança',
        contaNome: 'Indústria Metalmecânica Aliança',
        valor: 36000,
        etapa: 'Prospecção',
        previsao: '2026-11-05 18:00:00.000Z',
        obs: 'Primeiro contato realizado com SESMT e Recursos Humanos.',
      },
      {
        nome: 'Ecossistema Completo 2.100 Vidas - Varejo Mais',
        contaNome: 'Grupo Varejo Mais Brasil',
        valor: 168000,
        etapa: 'Fechamento',
        previsao: '2026-09-01 18:00:00.000Z',
        obs: 'Contrato assinado. Início da implantação agendado para 30 dias.',
      },
    ]

    const createdNegocios = {}
    for (const n of negociosSeed) {
      const conta = createdContas[n.contaNome]
      if (!conta) continue
      let rec
      try {
        rec = app.findFirstRecordByData('negocios', 'nome', n.nome)
      } catch (_) {
        rec = new Record(negociosCol)
        rec.set('nome', n.nome)
        rec.set('conta_id', conta.id)
        rec.set('valor', n.valor)
        rec.set('etapa', n.etapa)
        rec.set('previsao_fechamento', n.previsao)
        rec.set('responsavel_id', userId)
        rec.set('observacoes', n.obs)
        app.save(rec)
      }
      createdNegocios[n.nome] = rec
    }

    // 4. Seed Cadencias
    const cadenciasSeed = [
      {
        nome: 'Cadência Prospecção - Diagnóstico NR-1 & Saúde',
        descricao:
          'Sequência multicanal para líderes de RH e SESMT focando no custo invisível do absenteísmo e conformidade da nova NR-1.',
        status: 'ativa',
        etapas: [
          {
            tipo: 'email',
            titulo: 'Diagnóstico do clima e custo oculto de ausências na [Nome da Conta]',
            corpo:
              'Olá, tudo bem?\n\nNotamos que empresas do setor de [Nome da Conta] enfrentam desafios com o custo de afastamentos não previstos. Na Risomed, invertemos essa lógica: entregamos o diagnóstico psicossocial em até 15 dias, sem fidelidade.\n\nPodemos conversar 10 minutos nesta semana?',
            delay_dias: 0,
          },
          {
            tipo: 'tarefa',
            descricao:
              'Follow-up telefônico rápido com RH para confirmar recebimento e sondar tamanho do time.',
            delay_dias: 2,
          },
          {
            tipo: 'email',
            titulo: 'Como reduzimos de 10% a 25% de ausências com Pronto Socorro Digital',
            corpo:
              'Olá!\n\nCompartilho um case recente onde a atuação rápida em telemedicina (20+ especialidades) e o mapa de riscos da NR-1 protegeram a folha de pagamento da operação.\n\nGostaria de conhecer nosso modelo de piloto?',
            delay_dias: 4,
          },
          {
            tipo: 'tarefa',
            descricao:
              'Mensagem via WhatsApp executivo ou ligação para alinhar agendamento de diagnóstico-piloto.',
            delay_dias: 7,
          },
        ],
      },
      {
        nome: 'Cadência Reengajamento - Proposta em Aberto',
        descricao:
          'Fluxo de follow-up para contas que receberam proposta comercial e precisam de validação com comitê de diretoria.',
        status: 'ativa',
        etapas: [
          {
            tipo: 'email',
            titulo: 'Dúvidas sobre a proposta Risomed para [Nome da Conta]?',
            corpo:
              'Olá!\n\nGostaria de saber se o comitê conseguiu avaliar a proposta comercial da Risomed. Estamos à disposição para simular os ganhos de ROI em ausências e esclarecer pontos de implantação em 30 dias.\n\nUm abraço,\nAlexandre - Risomed',
            delay_dias: 1,
          },
          {
            tipo: 'tarefa',
            descricao:
              'Ligar para o sponsor interno da conta para identificar possíveis objeções sobre orçamento ou prazos.',
            delay_dias: 3,
          },
          {
            tipo: 'email',
            titulo: 'Garantia de piloto sem fidelidade - Risomed',
            corpo:
              'Lembrando que na Risomed a sua empresa pode iniciar pelo diagnóstico-piloto sem fidelidade, comprovando o valor antes de qualquer expansão.',
            delay_dias: 6,
          },
        ],
      },
    ]

    for (const cad of cadenciasSeed) {
      try {
        app.findFirstRecordByData('cadencias', 'nome', cad.nome)
      } catch (_) {
        const rec = new Record(cadenciasCol)
        rec.set('nome', cad.nome)
        rec.set('descricao', cad.descricao)
        rec.set('status', cad.status)
        rec.set('responsavel_id', userId)
        rec.set('etapas', cad.etapas)
        app.save(rec)
      }
    }

    // 5. Seed Tarefas
    const tarefasSeed = [
      {
        titulo: 'Follow-up da proposta comercial com diretoria médica',
        contaNome: 'Hospital e Maternidade São Lucas',
        tipo: 'call',
        prioridade: 'Alta',
        data_vencimento: '2026-09-12 14:00:00.000Z',
        status: 'pendente',
        origem: 'manual',
        descricao:
          'Alinhar detalhamento de cobertura do Pronto Socorro Digital e integração com prontuário.',
      },
      {
        titulo: 'Apresentar relatório preliminar do diagnóstico psicossocial',
        contaNome: 'TecnoLogística Log Express',
        tipo: 'reuniao',
        prioridade: 'Alta',
        data_vencimento: '2026-09-11 16:30:00.000Z',
        status: 'pendente',
        origem: 'manual',
        descricao:
          'Reunião presencial/vídeo com Gerente de RH para revisar os primeiros indicadores de risco NR-1.',
      },
      {
        titulo: 'Envio de minuta contratual e validação DPO/Jurídico',
        contaNome: 'FinTech Nexus Soluções',
        tipo: 'email',
        prioridade: 'Média',
        data_vencimento: '2026-09-15 18:00:00.000Z',
        status: 'pendente',
        origem: 'cadencia',
        descricao:
          'Encaminhar termos de conformidade LGPD e cláusulas sem carência acordadas na reunião.',
      },
      {
        titulo: 'Primeiro contato: apresentação da Risomed para SESMT',
        contaNome: 'Indústria Metalmecânica Aliança',
        tipo: 'call',
        prioridade: 'Média',
        data_vencimento: '2026-09-13 11:00:00.000Z',
        status: 'pendente',
        origem: 'cadencia',
        descricao:
          'Tarefa gerada pela cadência de prospecção. Discutir conformidade NR-1 com engenheiro de segurança.',
      },
      {
        titulo: 'Kick-off de implantação do ecossistema de saúde',
        contaNome: 'Grupo Varejo Mais Brasil',
        tipo: 'reuniao',
        prioridade: 'Alta',
        data_vencimento: '2026-09-08 10:00:00.000Z',
        status: 'concluida',
        origem: 'manual',
        descricao:
          'Reunião de alinhamento de cronograma de 30 dias para cadastramento dos colaboradores.',
      },
    ]

    for (const t of tarefasSeed) {
      const conta = createdContas[t.contaNome]
      if (!conta) continue
      try {
        app.findFirstRecordByData('tarefas', 'titulo', t.titulo)
      } catch (_) {
        const rec = new Record(tarefasCol)
        rec.set('titulo', t.titulo)
        rec.set('conta_id', conta.id)
        rec.set('tipo', t.tipo)
        rec.set('prioridade', t.prioridade)
        rec.set('data_vencimento', t.data_vencimento)
        rec.set('status', t.status)
        rec.set('responsavel_id', userId)
        rec.set('origem', t.origem)
        rec.set('descricao', t.descricao)
        app.save(rec)
      }
    }

    // 6. Seed Atividades
    const atividadesSeed = [
      {
        contaNome: 'Hospital e Maternidade São Lucas',
        tipo: 'proposta' === 'proposta' ? 'email' : 'email',
        descricao:
          'Envio da proposta comercial personalizada para 1.200 colaboradores com Pronto Socorro Digital e Odonto.',
        data_hora: '2026-09-09 15:30:00.000Z',
      },
      {
        contaNome: 'TecnoLogística Log Express',
        tipo: 'reuniao',
        descricao:
          'Reunião de alinhamento sobre o diagnóstico psicossocial piloto e questionários NR-1.',
        data_hora: '2026-09-08 11:00:00.000Z',
      },
      {
        contaNome: 'FinTech Nexus Soluções',
        tipo: 'call',
        descricao:
          'Alinhamento com comitê de pessoas sobre abrangência do Wellhub e farmácia de descontos.',
        data_hora: '2026-09-07 14:20:00.000Z',
      },
      {
        contaNome: 'Grupo Varejo Mais Brasil',
        tipo: 'negocio_fechado',
        descricao: 'Negócio fechado com sucesso! Contrato assinado para 2.100 vidas.',
        data_hora: '2026-09-01 16:45:00.000Z',
      },
    ]

    for (const atv of atividadesSeed) {
      const conta = createdContas[atv.contaNome]
      if (!conta) continue
      try {
        app.findFirstRecordByData('atividades', 'descricao', atv.descricao)
      } catch (_) {
        const rec = new Record(atividadesCol)
        rec.set('tipo', atv.tipo)
        rec.set('descricao', atv.descricao)
        rec.set('data_hora', atv.data_hora)
        rec.set('conta_id', conta.id)
        rec.set('usuario_id', userId)
        app.save(rec)
      }
    }
  },
  (app) => {
    // down logic is optional for seed data
  },
)
