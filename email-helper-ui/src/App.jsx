import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import EmailList from './components/EmailList'
import { simulateEmail } from './api/client'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [userId] = useState('demo')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSimulateEmail = async () => {
    try {
      const sampleEmail = {
        from: 'example@company.com',
        to: `${userId}@test.com`,
        subject: 'Test Email',
        content: 'This is a test email to demonstrate the AI email assistant. It will be automatically classified and summarized.'
      }
      
      await simulateEmail(sampleEmail)
      alert('Email simulated! Check the Emails tab.')
      setRefreshKey(prev => prev + 1) // Trigger refresh
    } catch (error) {
      alert('Failed to simulate email: ' + error.message)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 30px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          color: '#333',
          marginBottom: '10px'
        }}>
          AI Email Helper
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Chat with AI about your emails • Powered by Cloudflare Workers AI
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 20px',
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
      }}>
        <TabButton 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </TabButton>
        <TabButton 
          active={activeTab === 'emails'} 
          onClick={() => setActiveTab('emails')}
        >
          📧 Emails
        </TabButton>
        <button
          onClick={handleSimulateEmail}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ➕ Simulate Email
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'chat' && (
          <ChatWindow userId={userId} sessionId="session1" />
        )}
        
        {activeTab === 'emails' && (
          <EmailList userId={userId} key={refreshKey} />
        )}
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
      }}>
        Built with React + Cloudflare Workers + Workers AI
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 24px',
        backgroundColor: active ? '#f38020' : '#fff',
        color: active ? '#fff' : '#333',
        border: active ? 'none' : '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  )
}

export default App
