import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'

import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Pipeline from '@/pages/Pipeline'
import DetalhesNegocio from '@/pages/DetalhesNegocio'
import Contas from '@/pages/Contas'
import DetalhesConta from '@/pages/DetalhesConta'
import Tarefas from '@/pages/Tarefas'
import Cadencias from '@/pages/Cadencias'
import Assistente from '@/pages/Assistente'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected CRM Routes inside Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/negocios/:id" element={<DetalhesNegocio />} />
            <Route path="/contas" element={<Contas />} />
            <Route path="/contas/:id" element={<DetalhesConta />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/cadencias" element={<Cadencias />} />
            <Route path="/assistente" element={<Assistente />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
