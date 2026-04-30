import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/auth'
import * as api from '../services/auth'

export default function Profile() {
  const { accessToken, logout } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!accessToken) return
    api.getProfile(accessToken).then(setProfile).catch(() => setMsg('Failed to load profile'))
  }, [accessToken])

  if (!accessToken) return <div className="card">Please login to view profile.</div>

  return (
    <div className="card profile-card">
      <h2>Your Profile</h2>
      {profile ? (
        <div>
          <div><strong>Username:</strong> {profile.username}</div>
          <div><strong>Email:</strong> {profile.email}</div>
        </div>
      ) : <div>Loading...</div>}
      <button onClick={async () => { await logout() }} className="secondary">Logout</button>
      <div className="msg">{msg}</div>
    </div>
  )
}
