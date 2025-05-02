import { useState, useEffect } from 'react'
import { Template } from '../types/rooms-d';
import { useWargame } from '../contexts/WargameContext';
import { useIndexedDBData } from '../hooks/useIndexedDBData';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([])  
  const {xmppClient} = useWargame()
  const { data: mockTemplates, loading } = useIndexedDBData<Template[]>('templates')  

  useEffect(() => {
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      if (!loading && mockTemplates) {
        setTemplates(mockTemplates)
      }
    } else {
      // TODO: use real data
      throw new Error('not yet getting xmpp templates')
    }
  }, [xmppClient, loading, mockTemplates]);

  return { templates };
}