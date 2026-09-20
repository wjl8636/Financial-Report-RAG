import * as api from '@/api'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Button, Upload } from 'antd'

const ACCEPT = ['pdf', 'doc', 'docx', 'txt']
const LIMIT = 5

export default function Uploader(props: {
  sessionId: string
  onSuccess: (file: File) => void
}) {
  const { sessionId } = props

  return (
    <Upload
      showUploadList={false}
      maxCount={1}
      accept={ACCEPT.map((item) => `.${item}`).join(',')}
      customRequest={async (options) => {
        const file = options.file as File
        const { onSuccess, onError } = options

        const _onError = (error: Error) => {
          onError?.(error)
          window.$app.message.error(error.message)
        }

        // 检查后缀名
        const ext = file.name?.split('.')?.pop()?.toLowerCase() ?? ''
        const isAccept = ACCEPT.includes(ext)
        if (!isAccept) {
          return _onError?.(new Error(`只支持 ${ACCEPT.join('、')}`))
        }

        // 文件大小限制
        const isLimit = file.size <= LIMIT * 1024 * 1024
        if (!isLimit) {
          return _onError?.(new Error(`文件大小不能超过${LIMIT}M`))
        }

        try {
          // 上传文件
          await api.session.quickParse({
            session_id: sessionId,
            file,
          })
          onSuccess?.('')
          props.onSuccess?.(file)
          window.$app.message.success('上传成功')
        } catch (error: any) {
          onError?.(error)
        }
      }}
    >
      <Button
        className="com-sender__action--contract"
        variant="filled"
        color="default"
        shape="round"
      >
        <PlusCircleOutlined style={{ fontSize: 14 }} />
        文档
      </Button>
    </Upload>
  )
}
