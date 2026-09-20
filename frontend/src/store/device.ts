import { proxy } from 'valtio'

const state = proxy({
  chatting: false,
})

const actions = {
  setChatting(chatting: boolean) {
    state.chatting = chatting
  },
}

export const deviceState = state
export const deviceActions = actions
