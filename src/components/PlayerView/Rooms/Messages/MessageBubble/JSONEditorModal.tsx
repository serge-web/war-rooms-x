import React, { useRef, useEffect } from 'react'
import { Modal, Input } from 'antd'
import { CodeOutlined } from '@ant-design/icons'
import './index.css'

interface JSONEditorModalProps {
  visible: boolean
  content: string
  onSave: (content: string) => void
  onCancel: () => void
}

const JSONEditorModal: React.FC<JSONEditorModalProps> = ({ 
  visible, 
  content, 
  onSave, 
  onCancel 
}) => {
  const [jsonContent, setJsonContent] = React.useState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Update content when it changes
  useEffect(() => {
    if (visible) {
      setJsonContent(content)
      // Focus the editor when it becomes visible
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus()
          // Move cursor to the end
          const length = content.length
          editorRef.current.selectionStart = length
          editorRef.current.selectionEnd = length
        }
      }, 0)
    }
  }, [visible, content])

  const handleSave = () => {
    try {
      // Validate JSON before saving
      JSON.parse(jsonContent)
      onSave(jsonContent)
    } catch (e) {
      console.error('Invalid JSON content', e)
      // You might want to show an error message to the user here
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <Modal
      title={
        <div className="json-editor-header">
          <CodeOutlined />
          <span>Edit JSON Content</span>
        </div>
      }
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
      width={800}
      className="json-editor-modal"
    >
      <div className="json-editor-container">
        <Input.TextArea
          ref={editorRef}
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="json-editor"
          autoSize={{ minRows: 10, maxRows: 20 }}
          spellCheck={false}
        />
        <div className="json-validation-error">
          {(() => {
            try {
              JSON.parse(jsonContent)
              return null
            } catch (e) {
              return 'Invalid JSON: ' + (e as Error).message
            }
          })()}
        </div>
      </div>
    </Modal>
  )
}

export default JSONEditorModal
