import IconAvatar from '@/assets/chat/avatar.svg'
import { ChatRole, ChatType } from '@/configs'
import { Avatar } from 'antd'
import classNames from 'classnames'
import { useMemo } from 'react'
import { createChatIdText } from '../shared'
import styles from './chat-message.module.scss'
import { Result } from './result'
import ChooseFile from './select-file'

function UserMessage(props: { item: API.ChatItem }) {
  const { item } = props

  return (
    <div
      className={classNames(
        styles['chat-message-item'],
        styles['chat-message-item--user'],
      )}
    >
      <div className={styles['chat-message-item__content']}>{item.content}</div>
    </div>
  )
}

function AssistantMessage(props: {
  item: API.ChatItem
  isEnd?: boolean
  onSend?: (text: string) => void
  onOpenCiations?: () => void
  onRefrence?: (index: number) => void
}) {
  const { item, isEnd, onSend, onOpenCiations, onRefrence } = props

  const id = useMemo(() => {
    if (item.type === ChatType.Document) {
      return createChatIdText(item.id)
    }
  }, [item.id, item.type])

  return (
    <div
      id={id}
      className={classNames(
        styles['chat-message-item'],
        styles['chat-message-item--assistant'],
      )}
    >
      <div className={styles['chat-message-item__sender']}>
        <Avatar className={styles['avatar']} src={IconAvatar} />

        <div className={styles['name']}>Doc Copilet</div>
      </div>

      <div className={styles['chat-message-item__content']}>
        {(() => {
          switch (item.type) {
            case ChatType.Document:
              if (item.loading && !item.documents?.length) {
                return <ChooseFile.Searching />
              } else if (!item.error) {
                return (
                  <ChooseFile.Complete
                    contractsLength={item.documents?.length ?? 0}
                    citationsLength={item.reference?.length ?? 0}
                    onClick={onOpenCiations}
                  />
                )
              }
          }
        })()}

        <Result
          item={item}
          isEnd={isEnd}
          onSend={onSend}
          onRefrence={onRefrence}
        />
      </div>
    </div>
  )
}

export default function ChatMessage(props: {
  list: API.ChatItem[]
  onSend?: (text: string) => void
  onOpenCiations?: (item: API.ChatItem) => void
  onRefrence?: (target: API.Reference) => void
}) {
  const { list, onSend, onOpenCiations, onRefrence } = props

  return (
    <div className={styles['chat-message']}>
      {list.map((item, index) => {
        if (item.role === ChatRole.User) {
          return <UserMessage key={item.id} item={item} />
        }

        return (
          <AssistantMessage
            key={item.id}
            item={item}
            isEnd={list.length - 1 === index}
            onSend={onSend}
            onOpenCiations={() => onOpenCiations?.(item)}
            onRefrence={(index) => {
              const target = item.reference?.[index]
              if (target) onRefrence?.(target)
            }}
          />
        )
      })}
    </div>
  )
}
