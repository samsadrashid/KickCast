import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsAndConditions from './pages/TermsAndConditions.jsx'
import DeleteAccount from './pages/DeleteAccount.jsx'

const path = window.location.pathname.replace(/\/$/, '')

let Page = App
if (path === '/privacy-policy') Page = PrivacyPolicy
else if (path === '/terms-and-conditions') Page = TermsAndConditions
else if (path === '/delete-account') Page = DeleteAccount

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
