import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { AppDataProvider } from './context/AppDataContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
