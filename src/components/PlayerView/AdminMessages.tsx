import React from 'react'

const AdminMessages: React.FC = () => {
  return (
    <div className="admin-messages-container">
      <h3>Admin Messages</h3>
      <div className="messages-list">
        {/* Admin messages will be displayed here */}
        <p>No messages from admin</p>
      </div>
    </div>
  )
}

export default AdminMessages
