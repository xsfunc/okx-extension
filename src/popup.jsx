import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, CssVarsProvider } from '@mui/joy'
import Popup from './pages/Popup'

ReactDOM.createRoot(document.body).render(
  <React.StrictMode>
    <CssVarsProvider defaultMode='system'>
      <CssBaseline />
      <main>
        <Popup />
      </main>
      <CssBaseline />
    </CssVarsProvider>
  </React.StrictMode>,
)
