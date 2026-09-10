import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  BookOpen,
} from 'lucide-react'
import { crmService } from '@/services/crmService'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RisomedLogo } from '@/components/RisomedLogo'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: { source_id: string; title?: string }[]
}

const EXEMPLOS_PROMPTS = [
  'Como devo abordar um lead na etapa de Diagnóstico?',
  'Sugira um e-mail de follow-up para uma conta com 5 dias sem interação.',
  'Qual o argumento da Risomed quando o cliente diz que já tem plano de saúde?',
  'Quais as dores principais de absenteísmo na indústria com a NR-1?',
]

export default function Assistente() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o Assistente de Inteligência Comercial da Risomed. Estou conectado aos dados de contas, negócios e tarefas do seu pipeline. Como posso orientar sua jornada de vendas ou quebra de objeções em saúde corporativa hoje?',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setLoading(true)

    try {
      const resp = await crmService.askAgent(text, conversationId)
      if (resp.conversation_id) {
        setConversationId(resp.conversation_id)
      }

      const botMsg: Message = {
        id: resp.message_id || `bot-${Date.now()}`,
        role: 'assistant',
        content: resp.content,
        citations: resp.citations,
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err: unknown) {
      console.error(err)
      toast({
        title: 'Falha no assistente',
        description:
          err instanceof Error
            ? err.message
            : 'O agente de IA está processando ou temporariamente indisponível.',
        variant: 'destructive',
      })
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content:
            'Desculpe, ocorreu uma instabilidade ao conectar com o serviço de inteligência. Por favor, tente novamente em alguns instantes.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#003882] to-[#0052be] flex items-center justify-center text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A]">
                Jornada Comercial · Agente de IA Risomed
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF7F0] text-[#00A859]">
                Nativo Skip Cloud
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Especialista em saúde corporativa, diagnósticos NR-1 e condução do funil B2B.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setConversationId(null)
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: 'Conversa reiniciada. Em que posso apoiar sua jornada comercial agora?',
              },
            ])
          }}
          className="text-xs border-[#CBD5E1] text-[#64748B] hover:text-[#003882]"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Nova Conversa
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8FAFC] custom-scrollbar">
        {messages.map((m) => {
          const isUser = m.role === 'user'

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {isUser ? (
                <div className="h-8 w-8 rounded-full bg-[#003882] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#003882] to-[#00A859] p-0.5 shrink-0 flex items-center justify-center">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[#003882]">
                    <Sparkles className="h-4 w-4 text-[#00A859]" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#003882] text-white rounded-tr-none'
                    : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-tl-none'
                }`}
              >
                {m.content}

                {/* Citations / Fontes */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] text-[10px] text-[#64748B]">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <BookOpen className="h-3 w-3 text-[#003882]" />
                      Fontes consultadas:
                    </span>
                    {m.citations.map((c, i) => (
                      <span key={i} className="inline-block mr-2 text-[#003882] font-semibold">
                        • {c.title || c.source_id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#003882] to-[#00A859] p-0.5 shrink-0 flex items-center justify-center">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[#003882]">
                <Sparkles className="h-4 w-4 text-[#00A859] animate-spin" />
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-none p-4 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full bg-[#003882] animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#00A859] animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#003882] animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
                <span className="text-[11px] text-[#64748B] ml-2">
                  Consultando dados e formulando resposta...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Sugestões rápidas de prompt */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-white border-t border-[#F1F5F9] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#64748B] shrink-0">Sugestões:</span>
          {EXEMPLOS_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 text-[11px] rounded-full border border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:border-[#003882] hover:text-[#003882] shrink-0 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E2E8F0]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Pergunte ao assistente sobre abordagens, objeções ou dados do CRM..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1 h-11 text-xs focus-visible:ring-[#003882]"
          />
          <Button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="h-11 px-5 bg-[#003882] hover:bg-[#00285e] text-white font-semibold transition active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
