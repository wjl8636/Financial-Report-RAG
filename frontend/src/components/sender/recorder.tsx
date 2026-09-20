import * as api from '@/api'
import IconRecorder from '@/assets/component/recorder.svg'
import IconRecorderActive from '@/assets/component/recorder@active.svg'
import { useUnmount } from 'ahooks'
import { Button } from 'antd'
import { LabASR } from 'byted-ailab-speech-sdk'
import { useRef, useState } from 'react'

function buildFullUrl(url: string, auth: Record<string, string>) {
  const arr = []
  for (const key in auth) {
    arr.push(`${key}=${encodeURIComponent(auth[key])}`)
  }
  return `${url}?${arr.join('&')}`
}

export default function Recorder(props: {
  onMessage?: (text: string, fullData: Record<string, any>) => void
}) {
  const { onMessage } = props

  const recordStopping = useRef(false)
  const fullResponseRef = useRef<any>()
  const [recording, setRecording] = useState(false)
  const [starting, setStarting] = useState(false)

  const [asrClient] = useState(
    LabASR({
      onMessage: async (text, fullData) => {
        fullResponseRef.current = fullData
        onMessage?.(text, fullData)
      },
      onStart() {},
      onClose() {
        console.log('asr', fullResponseRef.current)
        setRecording(false)
      },
      onError() {
        window.$app.message.error('WebSocket 异常')
        stopASR()
      },
    }),
  )
  const startASR = async () => {
    if (recording || starting) return
    setStarting(true)

    recordStopping.current = false
    const appid = import.meta.env.VITE_VOLC_APPID
    const accessKey = import.meta.env.VITE_VOLC_ACCESS_KEY
    const auth: Record<string, string> = {}

    const tokenRes = await api.other.getVolcToken({ appid, accessKey })
    const token = tokenRes.data?.jwt_token
    if (token) {
      auth.api_resource_id = 'volc.bigasr.sauc.duration'
      auth.api_app_key = appid
      auth.api_access_key = `Jwt; ${token}`
    }
    const fullUrl = buildFullUrl(
      `wss://openspeech.bytedance.com/api/v3/sauc/bigmodel`,
      auth,
    )
    const params = {
      url: fullUrl,
      config: {
        user: {
          uid: 'byted sdk demo',
        },
        audio: {
          format: 'pcm',
          rate: 16000,
          bits: 16,
          channel: 1,
        },
        request: {
          model_name: 'bigmodel',
          show_utterances: true,
        },
      },
    }
    asrClient.connect(params)
    setStarting(false)
    setRecording(true)
    try {
      await asrClient.startRecord()
    } catch (error: any) {
      setRecording(false)
      stopASR()

      if (error.message?.includes('Permission denied')) {
        window.$app.message.error('请开启麦克风权限')
      } else {
        window.$app.message.error(error.message)
      }
    }
  }
  const stopASR = () => {
    // 正在关闭中...
    if (recordStopping.current) {
      return
    }
    recordStopping.current = true
    asrClient.stopRecord()
  }

  useUnmount(stopASR)

  return recording ? (
    <Button shape="circle" variant="filled" danger onClick={stopASR}>
      <img src={IconRecorderActive} style={{ width: 20, height: 20 }} />
    </Button>
  ) : (
    <Button shape="circle" variant="filled" color="default" onClick={startASR}>
      <img src={IconRecorder} />
    </Button>
  )
}
