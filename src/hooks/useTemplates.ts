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
      return
    } else if (xmppClient === null) {
      if (!loading && mockTemplates) {
        setTemplates(mockTemplates)
      }
      return
    } else {
      const getPubSubItems = async () => {
        const templateDocs = await xmppClient.getPubSubCollectionItems('templates') as Template[]
        setTemplates(templateDocs)
      }      
      getPubSubItems()
    }
  }, [xmppClient, loading, mockTemplates]);

  return { templates };
}