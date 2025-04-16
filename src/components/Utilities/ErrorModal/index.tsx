import React from 'react'
import { Modal } from 'antd'
import { UserError } from '../../../types/rooms-d'

interface ErrorModalProps {
  error: UserError | null
  clearError: () => void
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, clearError }) => {
  if (!error) return null
  return (
    <Modal open={!!error} title={error?.title} onOk={clearError} onCancel={clearError}>
      <p>{error?.message}</p>
    </Modal>
  )
}

export default ErrorModal
