import * as api from '@/api'
import { useMount } from 'ahooks'
import { useNavigate } from 'react-router-dom'

export default function Index() {
  const navigate = useNavigate()

  useMount(async () => {
    const { data } = await api.session.create()
    navigate(`/chat/${data.session_id}`)
  })

  return null
}
