import React from 'react'

const UserDetails: React.FC = () => {
  return (
    <div className="user-details-container">
      <h3>User Details</h3>
      <div className="user-info">
        {/* User information will be displayed here */}
        <p>Not logged in</p>
      </div>
    </div>
  )
}

export default UserDetails
