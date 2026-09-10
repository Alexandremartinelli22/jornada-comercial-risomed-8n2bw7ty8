import type { RecordModel } from 'pocketbase'

export type StatusConta = 'Prospecção' | 'Diagnóstico' | 'Proposta' | 'Negociação' | 'Fechado'
export type EtapaNegocio = 'Prospecção' | 'Diagnóstico' | 'Proposta' | 'Negociação' | 'Fechamento'
export type TipoTarefa = 'call' | 'email' | 'reuniao'
export type PrioridadeTarefa = 'Alta' | 'Média' | 'Baixa'
export type StatusTarefa = 'pendente' | 'concluida'
export type OrigemTarefa = 'manual' | 'cadencia'
export type TipoAtividade =
  | 'call'
  | 'email'
  | 'reuniao'
  | 'tarefa_criada'
  | 'negocio_fechado'
  | 'observacao'
export type StatusCadencia = 'ativa' | 'pausada'

export interface UserRecord extends RecordModel {
  name?: string
  email: string
  avatar?: string
}

export interface ContaRecord extends RecordModel {
  nome: string
  cnpj?: string
  setor?: string
  tamanho?: 'Pequeno' | 'Médio' | 'Grande'
  site?: string
  telefone?: string
  status: StatusConta
  responsavel_id: string
  descricao_embedded?: string
  expand?: {
    responsavel_id?: UserRecord
  }
}

export interface NegocioRecord extends RecordModel {
  nome: string
  conta_id: string
  valor: number
  etapa: EtapaNegocio
  previsao_fechamento?: string
  responsavel_id: string
  observacoes?: string
  expand?: {
    conta_id?: ContaRecord
    responsavel_id?: UserRecord
  }
}

export interface TarefaRecord extends RecordModel {
  titulo: string
  conta_id: string
  tipo: TipoTarefa
  prioridade: PrioridadeTarefa
  data_vencimento: string
  status: StatusTarefa
  responsavel_id: string
  descricao?: string
  origem: OrigemTarefa
  expand?: {
    conta_id?: ContaRecord
    responsavel_id?: UserRecord
  }
}

export interface AtividadeRecord extends RecordModel {
  tipo: TipoAtividade
  descricao: string
  data_hora: string
  conta_id: string
  usuario_id: string
  expand?: {
    conta_id?: ContaRecord
    usuario_id?: UserRecord
  }
}

export interface EtapaCadencia {
  tipo: 'email' | 'tarefa'
  titulo?: string
  corpo?: string
  descricao?: string
  delay_dias: number
}

export interface CadenciaRecord extends RecordModel {
  nome: string
  descricao?: string
  etapas: EtapaCadencia[]
  status: StatusCadencia
  responsavel_id: string
  expand?: {
    responsavel_id?: UserRecord
  }
}

export interface DocumentoRecord extends RecordModel {
  negocio_id: string
  nome: string
  arquivo?: string | string[]
}

export interface ResumoPipelineResponse {
  etapas: {
    etapa: EtapaNegocio
    total: number
    valor: number
  }[]
  total_negocios: number
  valor_total: number
  valor_fechado: number
  total_contas: number
  tarefas_pendentes: number
}
