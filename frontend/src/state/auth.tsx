import React, { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/auth'

type User = {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
} | null;

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    // try to refresh on load
    let mounted = true
    authService.refresh().then(async data => {
      if (!mounted) return
      setAccessToken(data.accessToken)
      try {
        const me = await authService.getProfile(data.accessToken)
        setUser({
          userId: me.user.user_id,
          username: me.user.username,
          email: me.user.email,
          displayName: me.profile?.display_name || me.user.username,
          avatarUrl: me.profile?.avatar_url || null
        })
      } catch {
        setUser(null)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!accessToken) return
    // set up automatic refresh before expiry if you have exp in token
    const id = setInterval(() => {
      authService.refresh().then(d => setAccessToken(d.accessToken)).catch(() => { setAccessToken(null); setUser(null) })
    }, 1000 * 60 * 9) // every 9 minutes
    return () => clearInterval(id)
  }, [accessToken])

  const login = async (emailOrUsername: string, password: string) => {
    const data = await authService.login(emailOrUsername, password)
    setAccessToken(data.accessToken)

    const me = await authService.getProfile(data.accessToken)
    setUser({
      userId: me.user.user_id,
      username: me.user.username,
      email: me.user.email,
      displayName: me.profile?.display_name || me.user.username,
      avatarUrl: me.profile?.avatar_url || null
    })

    return data
  }

  const register = async (payload: { username: string, email: string, password: string }) => {
    return authService.register(payload)
  }

  const logout = async () => {
    try { await authService.logout() } catch (e) {}
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
