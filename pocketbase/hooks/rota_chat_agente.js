/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  'POST',
  '/backend/v1/ask-agent',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth ? e.auth.id : null
      if (!userId) {
        return e.unauthorizedError('Autenticação necessária')
      }

      const message = body.message ? String(body.message).trim() : ''
      if (!message) {
        return e.badRequestError('A mensagem não pode ser vazia')
      }

      const conversationId = body.conversation_id || null

      const result = $ai.agent('jornada-comercial').chat({
        user_id: userId,
        conversation_id: conversationId,
        message: message,
      })

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: result.citations || [],
        message_id: result.message_id,
      })
    } catch (err) {
      console.error('Erro no chat do agente:', err)
      if (typeof SkipAiConfigError !== 'undefined' && err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Assistente de IA temporariamente indisponível (gateway)' })
      }
      if (typeof SkipAiAgentsError !== 'undefined' && err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, {
          error: status >= 500 ? 'Falha na solicitação ao agente' : err.message,
        })
      }
      return e.json(500, { error: err.message || 'Falha ao processar mensagem do assistente' })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/chats',
  (e) => {
    try {
      const userId = e.auth ? e.auth.id : null
      if (!userId) return e.unauthorizedError('auth required')
      const limit = parseInt(e.requestInfo().query ? e.requestInfo().query.limit : '20', 10) || 20
      return e.json(
        200,
        $ai.agent('jornada-comercial').listConversations({ user_id: userId, limit: limit }),
      )
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/chats/{conversationId}/messages',
  (e) => {
    try {
      const userId = e.auth ? e.auth.id : null
      if (!userId) return e.unauthorizedError('auth required')
      const conversationId = e.request.pathValue('conversationId')
      return e.json(
        200,
        $ai.agent('jornada-comercial').listMessages({
          conversation_id: conversationId,
          user_id: userId,
        }),
      )
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
