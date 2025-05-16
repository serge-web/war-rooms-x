import React from 'react'
import { Modal, Typography, Space } from 'antd'
import { UserInfo } from '../../../types/rooms-d'
import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

interface InfoModalProps {
  info: UserInfo | null
  clearModal: () => void
}

const InfoModal: React.FC<InfoModalProps> = ({ info, clearModal }) => {
  if (!info) return null

  // Default to 'info' type if not specified
  const modalType = info.type || 'info'
  
  // Select the appropriate icon based on the modal type
  const getIcon = () => {
    switch (modalType) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '22px' }} />
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '22px' }} />
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '22px' }} />
      case 'info':
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '22px' }} />
    }
  }

  return (
    <Modal 
      open={!!info} 
      title={info.title} 
      onOk={clearModal} 
      onCancel={clearModal}
    >
      <Space>
        {getIcon()}
        <Typography.Paragraph style={{ margin: 0 }}>
          {info.message}
        </Typography.Paragraph>
      </Space>
    </Modal>
  )
}

export default InfoModal
