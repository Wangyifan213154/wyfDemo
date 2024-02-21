import { computed } from 'vue'
import { useStore } from 'vuex'

export function useMapper(mapper, mapFn) {
  const store = useStore()

  const storeStateFns = mapFn(mapper)

  const storeState = {}
  Object.keys(storeStateFns).forEach((fnKey) => {
    const fn = storeStateFns[fnKey].bind({ $store: store })
    storeState[fnKey] = computed(fn)
  })

  return storeState
}
