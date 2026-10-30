import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'

async function start() {
  // `npm run dev:mock` answers API calls with fake data; other modes never load the shim
  let devTools: ReactNode = null
  if (import.meta.env.MODE === 'mock') {
    const { installMockApi, MockToolbar } = await import('./mocks')
    installMockApi()
    devTools = <MockToolbar />
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <ScrollToTop />
        <App />
        {devTools}
      </BrowserRouter>
    </StrictMode>,
  )
}

void start()
