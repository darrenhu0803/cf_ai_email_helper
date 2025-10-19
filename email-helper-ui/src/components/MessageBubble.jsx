export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: isUser ? '#f38020' : '#fff',
        color: isUser ? '#fff' : '#333',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        wordWrap: 'break-word'
      }}>
        <div style={{
          fontSize: '14px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap'
        }}>
          {message.content}
        </div>
        {message.timestamp && (
          <div style={{
            fontSize: '11px',
            marginTop: '6px',
            opacity: 0.7
          }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

