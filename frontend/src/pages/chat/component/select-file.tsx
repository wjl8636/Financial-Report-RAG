import IconCompleted from '@/assets/chat/completed.svg'
import IconFile from '@/assets/chat/file.svg'
import IconSelectFile from '@/assets/chat/select-file.svg'
import { RightOutlined } from '@ant-design/icons'
import { Button, Checkbox } from 'antd'
import { useState } from 'react'
import styles from './select-file.module.scss'

export default function ChooseFile(props: {
  list?: API.Document[]
  onSubmit?: (list: API.Document[]) => void
}) {
  const { list, onSubmit } = props

  const [selectedFileList, setSelectedFileList] = useState<string[]>([])

  return (
    <div className={styles['select-file']}>
      <div className={styles['select-file__header']}>
        <img className={styles['icon']} src={IconSelectFile} />
        找到相关来源: {list?.length ?? 0}
      </div>

      <Checkbox.Group
        className={styles['select-file__content']}
        value={selectedFileList}
        onChange={(value) => setSelectedFileList(value)}
      >
        {list?.map((file) => (
          <Checkbox key={file.document_id} value={file.document_id}>
            <img className={styles['icon']} src={IconFile} />
            <div className={styles['name']} title={file.document_name}>
              {file.document_name}
            </div>
            {/* <div className={styles['date']}>{file.date}</div> */}
          </Checkbox>
        ))}
      </Checkbox.Group>

      <div className={styles['select-file__footer']}>
        <div>
          已选择 <b>{selectedFileList.length}</b> 个引文
        </div>

        <Button
          type="primary"
          size="small"
          disabled={selectedFileList.length === 0}
          onClick={() => {
            onSubmit?.(
              list?.filter((file) =>
                selectedFileList.includes(file.document_id),
              ) ?? [],
            )
          }}
        >
          添加
        </Button>
      </div>
    </div>
  )
}

function SelectFileSearching() {
  return (
    <div className={styles['select-file-searching']}>
      <div className={styles['icon']}></div>
      <div className={styles['title']}>正在搜索知识库</div>
    </div>
  )
}
ChooseFile.Searching = SelectFileSearching

function SelectFileComplete(props: {
  contractsLength: number
  citationsLength: number
  onClick?: () => void
}) {
  const { contractsLength, citationsLength, onClick } = props

  return (
    <div className={styles['select-file-complete']} onClick={onClick}>
      <img className={styles['icon']} src={IconCompleted} />
      <div className={styles['title']}>参考</div>
      <div className={styles['desc']}>
        {citationsLength ?? 0}个引文 来自{contractsLength ?? 0}个文件
      </div>
      <RightOutlined className={styles['arrow']} />
    </div>
  )
}

ChooseFile.Complete = SelectFileComplete
