import { useState, useEffect } from 'react';
import { getEmails, getEmailStats } from '../api/client';

export default function EmailList({ userId = 'demo' }) {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [emailsResult, statsResult] = await Promise.all([
        getEmails(userId),
        getEmailStats(userId)
      ]);
      
      setEmails(emailsResult.data || []);
      setStats(statsResult.data || {});
    } catch (error) {
      console.error('Failed to load emails:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      important: '#e74c3c',
      spam: '#95a5a6',
      newsletter: '#3498db',
      promotional: '#9b59b6',
      social: '#2ecc71',
      other: '#7f8c8d'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      important: '⚠️',
      spam: '🚫',
      newsletter: '📰',
      promotional: '🎁',
      social: '👥',
      other: '📧'
    };
    return icons[category] || icons.other;
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading emails...</div>;
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <p style={{ color: '#c00', fontWeight: 'bold' }}>Error loading emails</p>
        <p style={{ color: '#666' }}>{error}</p>
        <button 
          onClick={loadEmails}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#f38020',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <StatCard label="Total" value={stats.total} color="#3498db" />
          <StatCard label="Unread" value={stats.unread} color="#e74c3c" />
          <StatCard label="Important" value={stats.byCategory?.important || 0} color="#f39c12" />
          <StatCard label="Spam" value={stats.byCategory?.spam || 0} color="#95a5a6" />
        </div>
      )}

      {/* Email List */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #ddd',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold'
        }}>
          Your Emails ({emails.length})
        </div>
        
        {emails.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999'
          }}>
            No emails yet. Try simulating one!
          </div>
        ) : (
          <div>
            {emails.map((email, index) => (
              <EmailItem key={email.id || index} email={email} getCategoryColor={getCategoryColor} getCategoryIcon={getCategoryIcon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function EmailItem({ email, getCategoryColor, getCategoryIcon }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        backgroundColor: expanded ? '#f8f9fa' : '#fff',
        transition: 'background-color 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{getCategoryIcon(email.category)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {email.subject || '(No subject)'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            From: {email.from}
          </div>
        </div>
        <div style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: getCategoryColor(email.category)
        }}>
          {email.category}
        </div>
      </div>

      {email.summary && (
        <div style={{
          fontSize: '13px',
          color: '#555',
          marginTop: '8px',
          fontStyle: 'italic'
        }}>
          📝 {email.summary}
        </div>
      )}

      {expanded && email.content && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          fontSize: '13px',
          border: '1px solid #ddd'
        }}>
          <strong>Full Content:</strong>
          <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
            {email.content.substring(0, 500)}
            {email.content.length > 500 && '...'}
          </p>
        </div>
      )}

      {expanded && email.actionItems && email.actionItems.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#fff7e6',
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <strong>✅ Action Items:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            {email.actionItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

