import { userState } from '@/store/user'
import { Navigate } from 'react-router-dom'
import { useSnapshot } from 'valtio'
import { useRoute } from '../hook'

export function AuthGuard({ children }: { children?: React.ReactNode }) {
  const route = useRoute()
  const user = useSnapshot(userState)

  if (!route?.auth) return children

  if (user.token) {
    return children
  }

  return <Navigate to="/login" />
}
