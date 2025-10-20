export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[85%] rounded-lg px-4 py-2
        ${isUser 
          ? 'bg-blue-600 text-white' 
          : message.error 
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-[#2d2d2d] text-gray-200'
        }
      `}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs font-semibold text-gray-400">AI Assistant</span>
          </div>
        )}
        
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>

        {message.context && (
          <div className="mt-2 pt-2 border-t border-[#3c3c3c] text-xs text-gray-400">
            <span>📧 {message.context.emailCount} emails • 💬 {message.context.historyCount} in history</span>
          </div>
        )}
        
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

