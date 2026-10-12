import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Kanban,
  Building2,
  CheckSquare,
  Repeat,
  Bot,
  ListChecks,
  Search,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Bell,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { RisomedLogo } from './RisomedLogo'
import { crmService } from '@/services/crmService'
import type { ContaRecord } from '@/types/crm'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const navItems = [
  { name: 'Visão Geral', path: '/', icon: LayoutDashboard },
  { name: 'Pipeline', path: '/pipeline', icon: Kanban },
  { name: 'Fila Manual', path: '/fila', icon: ListChecks },
  { name: 'Contas', path: '/contas', icon: Building2 },
  { name: 'Tarefas', path: '/tarefas', icon: CheckSquare },
  { name: 'Cadências', path: '/cadencias', icon: Repeat },
  { name: 'Assistente', path: '/assistente', icon: Bot, badge: 'IA' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ContaRecord[]>([])
  const [allContas, setAllContas] = useState<ContaRecord[]>([])

  // Carregar contas para a busca global
  useEffect(() => {
    crmService
      .getContas()
      .then(setAllContas)
      .catch(() => {})
  }, [])

  // Atalho de teclado Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    const filtered = allContas.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.setor && c.setor.toLowerCase().includes(q)) ||
        (c.cnpj && c.cnpj.includes(q)),
    )
    setSearchResults(filtered)
  }, [searchQuery, allContas])

  // Page title resolution
  const getCurrentPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Visão Geral'
    if (path.startsWith('/pipeline')) return 'Pipeline de Vendas'
    if (path.startsWith('/fila')) return 'Fila Manual de Leads'
    if (path.startsWith('/contas/')) return 'Detalhes da Conta'
    if (path.startsWith('/contas')) return 'Contas B2B'
    if (path.startsWith('/negocios/')) return 'Detalhes do Negócio'
    if (path.startsWith('/tarefas')) return 'Gestão de Tarefas'
    if (path.startsWith('/cadencias')) return 'Cadências de Follow-up'
    if (path.startsWith('/assistente')) return 'Assistente de Vendas (IA)'
    return 'Jornada Comercial'
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Desktop (260px fixa) */}
      <aside className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 z-30 bg-white border-r border-[#E2E8F0]">
        {/* Top Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#F1F5F9]">
          <RisomedLogo size="md" />
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: active }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    active || isActive
                      ? 'bg-[#1B2E5A] text-white shadow-sm'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1B2E5A]'
                  }`
                }
              >
                {/* Active indicator bar: Risomed Orange #F58220 */}
                {(isActive || location.pathname === item.path) && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#F58220] rounded-r-md" />
                )}
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-[#29AABE]' : 'text-[#64748B] group-hover:text-[#1B2E5A]'
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#F58220] text-white' : 'bg-[#EBF6F8] text-[#29AABE]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Slogan Banner Risomed Oficial */}
        <div className="p-4 mx-3 mb-3 bg-[#EBF6F8] rounded-xl border border-[#C6E6EC] text-xs">
          <p className="font-bold text-[#1B2E5A] mb-1 font-heading">
            Resultado não é promessa. É dado.
          </p>
          <p className="text-[#475569] text-[11px] leading-relaxed">
            Diagnóstico que revela. Benefícios que resolvem. Dados que comprovam.
          </p>
        </div>

        {/* Sidebar Footer User */}
        <div className="p-3 border-t border-[#F1F5F9] bg-white">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFC] transition text-left focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-[#1B2E5A] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#29AABE]/30">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E293B] truncate">
                    {user?.name || 'Equipe Risomed'}
                  </p>
                  <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-[#64748B] cursor-default">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#F1F5F9]">
              <RisomedLogo size="sm" />
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#1B2E5A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                      isActive ? 'bg-[#1B2E5A] text-white' : 'text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#29AABE]' : ''}`} />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F58220] text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
            <div className="p-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col md:pl-[260px] min-w-0">
        {/* Header Fixo 64px */}
        <header className="h-16 sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu de navegação"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-[#64748B] hover:text-[#1B2E5A] hover:bg-[#F8FAFC]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#1B2E5A] tracking-tight font-heading">
                {getCurrentPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs text-[#64748B] hover:border-[#29AABE] hover:text-[#1B2E5A] transition group"
            >
              <Search className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-[#29AABE]" />
              <span className="hidden sm:inline">Buscar contas, leads...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#CBD5E1] rounded text-[#64748B]">
                Ctrl K
              </kbd>
            </button>

            {/* Notification bell badge */}
            <div className="relative">
              <button
                type="button"
                aria-label="Notificações da jornada"
                className="p-2 rounded-lg text-[#64748B] hover:text-[#1B2E5A] hover:bg-[#F8FAFC] transition"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F58220]" />
              </button>
            </div>

            {/* User Dropdown Header */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu do usuário"
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white transition focus:outline-none"
                >
                  <span className="hidden sm:block text-xs font-semibold text-[#1E293B]">
                    {user?.name?.split(' ')[0] || 'Comercial'}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-[#1B2E5A] text-white flex items-center justify-center font-bold text-xs border border-[#29AABE]/30">
                    {user?.name ? user.name[0].toUpperCase() : 'R'}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="font-semibold text-[#1E293B]">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-[#64748B] font-normal">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair da conta</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Global Search Dialog */}
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-[#E2E8F0] bg-white">
              <DialogTitle className="text-base font-semibold text-[#1B2E5A] flex items-center gap-2 font-heading">
                <Search className="h-4 w-4 text-[#29AABE]" />
                Busca Global de Contas
              </DialogTitle>
              <div className="mt-2">
                <Input
                  autoFocus
                  placeholder="Digite o nome da empresa, setor ou CNPJ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-6 text-xs text-[#94A3B8]">
                  Digite ao menos uma palavra para pesquisar nas contas corporativas.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#94A3B8]">
                  Nenhuma conta encontrada com o termo "{searchQuery}".
                </div>
              ) : (
                searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                      navigate(`/contas/${c.id}`)
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F1F5F9] text-left transition border border-transparent hover:border-[#CBD5E1]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1E293B]">{c.nome}</p>
                      <p className="text-xs text-[#64748B]">
                        {c.setor || 'Setor não informado'} {c.cnpj && `• ${c.cnpj}`}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'Fechado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'Negociação'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in-up">
          <Outlet />
        </main>

        {/* Footer Discreto */}
        <footer className="py-4 border-t border-[#E2E8F0] bg-white text-center text-xs text-[#94A3B8]">
          <p>
            Risomed · {new Date().getFullYear()} — Cuidamos das pessoas. Geramos resultados para
            empresas.
          </p>
        </footer>
      </div>
    </div>
  )
}
