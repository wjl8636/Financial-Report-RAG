import * as api from '@/api'
import { sessionActions, sessionState } from '@/store/session'
import { useRequest } from 'ahooks'
import { Collapse } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnapshot } from 'valtio'
import './nav.scss'

export function Nav() {
  const navigate = useNavigate()

  const session = useSnapshot(sessionState)

  useRequest(
    async () => {
      const { data } = await api.session.list(
        {},
        {
          loading: session.list.length ? false : true,
        },
      )
      return data
    },
    {
      refreshDeps: [sessionState.updateKey],
      onSuccess(data) {
        sessionActions.setList(data?.sessions || [])
      },
    },
  )

  const items = useMemo(
    () => [
      {
        key: '1',
        label: '历史',
        children: (
          <div>
            {session.list?.map((item) => (
              <div
                className="base-layout-nav__item"
                key={item.session_id}
                onClick={() => navigate(`/chat/${item.session_id}`)}
              >
                <div className="time">
                  {dayjs(item.created_at).format('HH:mm YYYY/MM/DD')}
                </div>
                <div className="title">{item.session_name}</div>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [session.list],
  )

  return (
    <div className="base-layout-nav">
      <Collapse items={items} accordion />
    </div>
  )
}
