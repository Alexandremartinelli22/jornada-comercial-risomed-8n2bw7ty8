/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm max-w-sm w-full">
        <h1 className="text-5xl font-black text-[#1B2E5A] mb-2 font-heading">404</h1>
        <p className="text-sm font-semibold text-[#0F172A] mb-1">Página não encontrada</p>
        <p className="text-xs text-[#64748B] mb-6">O endereço acessado não existe ou foi movido.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#1B2E5A] hover:bg-[#132140] text-white text-xs font-semibold shadow-sm transition"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  )
}

export default NotFound
