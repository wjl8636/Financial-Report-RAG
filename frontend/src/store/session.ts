import { proxy } from 'valtio'

const state = proxy({
  list: [] as API.Session[],
  updateKey: 0,
})

const actions = {
  setList(list: API.Session[]) {
    state.list = list
  },
  add(item: API.Session) {
    state.list.push(item)
  },
  updateKey() {
    state.updateKey += 1
  },
}

export const sessionState = state
export const sessionActions = actions
