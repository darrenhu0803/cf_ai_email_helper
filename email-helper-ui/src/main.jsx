import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('=== MAIN.JSX LOADING ===');
console.log('App component:', App);
console.log('Root element:', document.getElementById('root'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

console.log('=== REACT RENDERED ===');
