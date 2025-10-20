import { useState, useEffect } from 'react';
import { getEmails } from '../api/client';
import EmailListItem from './EmailListItem';

export default function EmailList({ category, onSelectEmail }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmails();
  }, [category]);

  async function loadEmails() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch emails from different users based on category
      // For demo, we'll use 'testuser' and filter client-side
      const response = await getEmails('testuser');
      
      // Handle response - check if data exists and is an array
      let emailData = [];
      if (response && response.data && Array.isArray(response.data)) {
        emailData = response.data;
      } else if (response && Array.isArray(response)) {
        emailData = response;
      }
      
      // Filter by category
      let filtered = emailData;
      if (category !== 'inbox') {
        filtered = emailData.filter(email => email.category === category);
      }
      
      setEmails(filtered);
    } catch (err) {
      console.error('Failed to load emails:', err);
      setError('Failed to load emails. Is the server running?');
      setEmails([]); // Ensure emails is always an array
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1f1f1f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1f1f1f]">
        <div className="text-center text-red-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-gray-200">{error}</p>
          <button 
            onClick={loadEmails}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1f1f1f]">
        <div className="text-center text-gray-500">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-semibold text-gray-300">No emails yet</p>
          <p className="text-sm mt-2 text-gray-500">Your {category} folder is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1f1f1f]">
      <div>
        {Array.isArray(emails) && emails.map((email) => (
          <EmailListItem
            key={email.id}
            email={email}
            onClick={() => onSelectEmail(email)}
          />
        ))}
      </div>
    </div>
  );
}

