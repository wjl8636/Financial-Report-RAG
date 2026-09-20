import { AuthGuard } from './auth'

export function RouterGuard({ children }: { children?: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
