import React from 'react'
import { Modal } from 'antd'
import { UserInfo } from '../../../types/rooms-d'

interface InfoModalProps {
  info: UserInfo | null
  clearModal: () => void
}

const InfoModal: React.FC<InfoModalProps> = ({ info, clearModal }) => {
  if (!info) return null
  return (
    <Modal open={!!info} title={info?.title} onOk={clearModal} onCancel={clearModal}>
      <p>{info?.message}</p>
    </Modal>
  )
}

export default InfoModal
