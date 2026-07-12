import { create } from 'zustand'
import { api, setSession, clearSession, getSession } from '../../shared/api.client'

interface AuthState {
  logged: boolean
  loading: boolean
  error: string | null
  login: (token: string) => Promise<boolean>
  logout: () => void
  check: () => Promise<boolean>
}

export const useAuth = create<AuthState>((set) => {
  const hasToken = !!getSession()
  return {
    logged: false,
    loading: hasToken,
    error: null,

    login: async (token) => {
      set({ loading: true, error: null })
      setSession(token)
      try {
        const res = await api('/verify')
        if (res.method === 'bearer-token') { set({ logged: true, loading: false }); return true }
        clearSession(); set({ error: 'Invalid token', loading: false }); return false
      } catch { clearSession(); set({ error: 'Invalid token', loading: false }); return false }
    },

    logout: () => { clearSession(); set({ logged: false, error: null }) },

    check: async () => {
      try { await api('/verify'); set({ logged: true, loading: false }); return true }
      catch { set({ logged: false, loading: false }); return false }
    },
  }
})
