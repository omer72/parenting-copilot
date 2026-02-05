import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './locales'
import { ThemeWrapper } from './theme/ThemeWrapper'
import './index.css'
import './theme/gradients.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeWrapper>
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeWrapper>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
