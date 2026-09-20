import IconMore from '@/assets/chat/more.svg'
import IconObjectActive from '@/assets/chat/object@active.svg'
import IconSearch from '@/assets/chat/search.svg'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Button, Dropdown, Input, Tooltip } from 'antd'
import { useMemo } from 'react'
import styles from './contracts.module.scss'

function ContractItem(props: { item: API.Document }) {
  const { item } = props

  const moreMenu = useMemo(() => {
    return [
      {
        key: 'Read',
        label: '阅读',
      },
      {
        key: 'Suspend',
        label: '暂停',
      },
      {
        key: 'Remove',
        label: '移除',
      },
    ]
  }, [item])

  return (
    <div className={styles['contracts__item']}>
      <div className={styles['name']} title={item.document_name}>
        {item.document_name}
      </div>
      <div className={styles['actions']}>
        <Tooltip
          classNames={{
            root: styles['contracts-tooltip'],
          }}
          title="挖掘"
        >
          <Button color="primary" variant="text" shape="circle" size="small">
            <img src={IconObjectActive} />
          </Button>
        </Tooltip>

        <Dropdown menu={{ items: moreMenu }}>
          <Button color="primary" variant="text" shape="circle" size="small">
            <img src={IconMore} />
          </Button>
        </Dropdown>
      </div>
    </div>
  )
}

export default function Contracts(props: { list: API.Document[] }) {
  const { list } = props

  return (
    <div className={styles['contracts']}>
      <div className={styles['contracts__search']}>
        <Input
          placeholder="搜索文档"
          suffix={<img src={IconSearch} alt="search" />}
        />

        <Button color="default" variant="outlined">
          <PlusCircleOutlined />
          添加
        </Button>
      </div>

      <div className={styles['contracts__title']}>已选择的文档</div>

      <div className={styles['contracts__list']}>
        {list.map((item) => (
          <ContractItem key={item.document_id} item={item} />
        ))}
      </div>
    </div>
  )
}
