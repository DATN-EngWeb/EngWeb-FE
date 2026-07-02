'use client';

import { useEffect, useState } from 'react';
import AIAssistantWidget from '../Student/AIAssistantWidget';

export default function AIAssistantGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const cookieEntry = document.cookie.split('; ').find((row) => row.startsWith('userRole='));
    const role = cookieEntry ? cookieEntry.split('=')[1] : localStorage.getItem('userRole');
    if (token && role === 'S') {
      setShow(true);
    }
  }, []);

  if (!show) return null;
  return <AIAssistantWidget />;
}
