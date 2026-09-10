import pb from '@/lib/pocketbase/client'
import type {
  ContaRecord,
  NegocioRecord,
  TarefaRecord,
  AtividadeRecord,
  CadenciaRecord,
  DocumentoRecord,
  ResumoPipelineResponse,
} from '@/types/crm'

export const crmService = {
  // Contas
  async getContas(filter?: string, sort = '-created'): Promise<ContaRecord[]> {
    return (await pb.collection('contas').getFullList({
      filter,
      sort,
      expand: 'responsavel_id',
    })) as unknown as ContaRecord[]
  },

  async getContaById(id: string): Promise<ContaRecord> {
    return (await pb.collection('contas').getOne(id, {
      expand: 'responsavel_id',
    })) as unknown as ContaRecord
  },

  async createConta(data: Partial<ContaRecord>): Promise<ContaRecord> {
    return (await pb.collection('contas').create(data)) as unknown as ContaRecord
  },

  async updateConta(id: string, data: Partial<ContaRecord>): Promise<ContaRecord> {
    return (await pb.collection('contas').update(id, data)) as unknown as ContaRecord
  },

  async deleteConta(id: string): Promise<boolean> {
    return await pb.collection('contas').delete(id)
  },

  // Negocios
  async getNegocios(filter?: string, sort = '-created'): Promise<NegocioRecord[]> {
    return (await pb.collection('negocios').getFullList({
      filter,
      sort,
      expand: 'conta_id,responsavel_id',
    })) as unknown as NegocioRecord[]
  },

  async getNegocioById(id: string): Promise<NegocioRecord> {
    return (await pb.collection('negocios').getOne(id, {
      expand: 'conta_id,responsavel_id',
    })) as unknown as NegocioRecord
  },

  async createNegocio(data: Partial<NegocioRecord>): Promise<NegocioRecord> {
    return (await pb.collection('negocios').create(data)) as unknown as NegocioRecord
  },

  async updateNegocio(id: string, data: Partial<NegocioRecord>): Promise<NegocioRecord> {
    return (await pb.collection('negocios').update(id, data)) as unknown as NegocioRecord
  },

  async deleteNegocio(id: string): Promise<boolean> {
    return await pb.collection('negocios').delete(id)
  },

  // Tarefas
  async getTarefas(filter?: string, sort = 'data_vencimento'): Promise<TarefaRecord[]> {
    return (await pb.collection('tarefas').getFullList({
      filter,
      sort,
      expand: 'conta_id,responsavel_id',
    })) as unknown as TarefaRecord[]
  },

  async createTarefa(data: Partial<TarefaRecord>): Promise<TarefaRecord> {
    return (await pb.collection('tarefas').create(data)) as unknown as TarefaRecord
  },

  async updateTarefa(id: string, data: Partial<TarefaRecord>): Promise<TarefaRecord> {
    return (await pb.collection('tarefas').update(id, data)) as unknown as TarefaRecord
  },

  async deleteTarefa(id: string): Promise<boolean> {
    return await pb.collection('tarefas').delete(id)
  },

  // Atividades
  async getAtividades(filter?: string, sort = '-data_hora'): Promise<AtividadeRecord[]> {
    return (await pb.collection('atividades').getFullList({
      filter,
      sort,
      expand: 'conta_id,usuario_id',
    })) as unknown as AtividadeRecord[]
  },

  async createAtividade(data: Partial<AtividadeRecord>): Promise<AtividadeRecord> {
    return (await pb.collection('atividades').create(data)) as unknown as AtividadeRecord
  },

  // Cadencias
  async getCadencias(filter?: string, sort = '-created'): Promise<CadenciaRecord[]> {
    return (await pb.collection('cadencias').getFullList({
      filter,
      sort,
      expand: 'responsavel_id',
    })) as unknown as CadenciaRecord[]
  },

  async getCadenciaById(id: string): Promise<CadenciaRecord> {
    return (await pb.collection('cadencias').getOne(id, {
      expand: 'responsavel_id',
    })) as unknown as CadenciaRecord
  },

  async createCadencia(data: Partial<CadenciaRecord>): Promise<CadenciaRecord> {
    return (await pb.collection('cadencias').create(data)) as unknown as CadenciaRecord
  },

  async updateCadencia(id: string, data: Partial<CadenciaRecord>): Promise<CadenciaRecord> {
    return (await pb.collection('cadencias').update(id, data)) as unknown as CadenciaRecord
  },

  async deleteCadencia(id: string): Promise<boolean> {
    return await pb.collection('cadencias').delete(id)
  },

  // Documentos
  async getDocumentos(negocioId: string): Promise<DocumentoRecord[]> {
    return (await pb.collection('documentos').getFullList({
      filter: `negocio_id = '${negocioId}'`,
      sort: '-created',
    })) as unknown as DocumentoRecord[]
  },

  async uploadDocumento(formData: FormData): Promise<DocumentoRecord> {
    return (await pb.collection('documentos').create(formData)) as unknown as DocumentoRecord
  },

  async deleteDocumento(id: string): Promise<boolean> {
    return await pb.collection('documentos').delete(id)
  },

  // Resumo Pipeline Hook
  async getResumoPipeline(): Promise<ResumoPipelineResponse> {
    const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/resumo-pipeline`, {
      headers: {
        Authorization: pb.authStore.token,
      },
    })
    if (!res.ok) {
      throw new Error('Falha ao obter resumo do pipeline')
    }
    return (await res.json()) as ResumoPipelineResponse
  },

  // Ask Agent Hook
  async askAgent(
    message: string,
    conversationId?: string | null,
  ): Promise<{
    conversation_id: string
    content: string
    citations?: { source_id: string; title?: string }[]
    message_id?: string
  }> {
    const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ask-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha na resposta do assistente')
    }
    return data
  },

  async getAgentConversations(): Promise<unknown[]> {
    const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/chats`, {
      headers: { Authorization: pb.authStore.token },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data?.items || []
  },

  async getConversationMessages(conversationId: string): Promise<unknown[]> {
    const res = await fetch(
      `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/chats/${conversationId}/messages`,
      {
        headers: { Authorization: pb.authStore.token },
      },
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data?.messages || []
  },
}
