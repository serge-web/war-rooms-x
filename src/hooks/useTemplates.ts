import { useState, useEffect } from 'react'
import { Template } from '../types/rooms-d';
import { useWargame } from '../contexts/WargameContext';
import { mockBackend } from '../mockData/mockAdmin';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([])  
  const {xmppClient} = useWargame()

  useEffect(() => {
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      const mockTemplates = mockBackend.templates
      setTemplates(mockTemplates)
    } else {
      // TODO: use real data
      throw new Error('not yet getting xmpp templates')
    }
  }, [xmppClient]);

  return { templates };
}