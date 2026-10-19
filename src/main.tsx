import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'

const root = document.getElementById('root')
if (!root) throw new Error('O elemento raiz da aplicação não foi encontrado.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
