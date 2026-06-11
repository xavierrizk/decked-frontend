import React, { useEffect, useState } from 'react';

/**
 * Usage:
 *   const [toast, setToast] = useToast();
 *   setToast('Message here!');
 *   <Toast message={toast} />
 */
export function useToast() {
  const [message, setMessage] = useState('');
  const show = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };
  return [message, show];
}

export default function Toast({ message }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-brand-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-glow border border-brand-500/50 flex items-center gap-2 whitespace-nowrap">
        <span>✓</span>
        {message}
      </div>
    </div>
  );
}
