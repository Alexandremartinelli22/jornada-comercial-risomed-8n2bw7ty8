export type FilaTagIcp = 'ICP Principal' | 'Fora ICP' | 'Incompleto'
export type FilaEstagio =
  | 'Prospecção'
  | 'Contato'
  | 'Apresentação'
  | 'Proposta'
  | 'Fechamento'
  | 'Perdido'

import type { RecordModel } from 'pocketbase'

export interface FilaLeadRecord extends RecordModel {
  data_origem: string
  empresa: string
  solicitante: string
  email?: string
  telefone?: string
  cnpj?: string
  vidas?: number
  cidade?: string
  origem: string
  tag_icp: FilaTagIcp
  estagio: FilaEstagio
  resultado_contato?: string
  proxima_acao: string
  data_proxima_acao: string
  motivo_perda?: string
  created_by: string
}
