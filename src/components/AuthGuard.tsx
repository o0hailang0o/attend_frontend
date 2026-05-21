import { Navigate } from 'react-router-dom'
import { getToken } from '../api'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('auth_user')
  const token = getToken()
  if (!user || !token) return <Navigate to="/login" replace />
  return <>{children}</>
}
