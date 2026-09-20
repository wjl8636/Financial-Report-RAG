import * as api from '@/api'
import IconSendThunder from '@/assets/component/send-thunder.svg'
import { FileOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Input, Space } from 'antd'
import classNames from 'classnames'
import { PropsWithChildren, useState } from 'react'
import './index.scss'
import Recorder from './recorder'
import Uploader from './uploader'

export default function ComSender(
  props: PropsWithChildren<{
    className?: string
    loading?: boolean
    onSend?: (value: string) => void | Promise<void>
    onContract?: () => void
    sessionId?: string
  }>,
) {
  const { className, onSend, onContract, loading, sessionId, ...rest } = props
  const [value, setValue] = useState('')

  async function send() {
    if (loading) return
    if (!value) return
    await onSend?.(value)
    setValue('')
  }

  const uploaded = useRequest(
    async () => {
      if (!sessionId) return

      const res = await api.session.documents({
        session_id: sessionId,
      })

      return res.data?.documents?.[0]
    },
    {
      refreshDeps: [sessionId],
    },
  )

  return (
    <div className={classNames('com-sender', className)} {...rest}>
      <Input.TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入你的问题…"
        autoSize={{ minRows: 2 }}
        autoFocus
      />

      <div className="com-sender__actions">
        <Space className="com-sender__actions-left" size={12}>
          <Recorder
            onMessage={(text) => {
              setValue(text)
            }}
          />
        </Space>

        <Space className="com-sender__actions-right" size={12}>
          {sessionId ? (
            uploaded.data ? (
              <Button
                className="com-sender__action--contract"
                variant="text"
                color="default"
                shape="round"
                disabled
                title={uploaded.data.document_name}
              >
                <FileOutlined style={{ fontSize: 14 }} />
                <span className="document-name">
                  {uploaded.data.document_name}
                </span>
              </Button>
            ) : (
              <Uploader
                sessionId={sessionId}
                onSuccess={(file) => {
                  uploaded.mutate({
                    document_name: file.name,
                  } as any)
                }}
              />
            )
          ) : null}
          <Button
            className="com-sender__action--send"
            variant="solid"
            color="primary"
            shape="round"
            onClick={send}
            loading={loading}
          >
            发送
            <img src={IconSendThunder} />
          </Button>
        </Space>
      </div>
    </div>
  )
}
