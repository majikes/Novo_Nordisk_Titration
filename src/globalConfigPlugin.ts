// https://skirtles-code.github.io/vue-examples/patterns/global-properties.html#application-level-provide-inject
// https://q-now.de/2021/10/lets-write-a-vue-js-3-plugin-with-typescript-from-scratch-part-1/
import { App, inject } from "vue"

const injectionKey = Symbol('rootApiURL')

export const useApiURL = () => inject(injectionKey)

export const plugin = {
  install (app: App) {
      // const rootApiURL = 'https://ru9840s6bl.execute-api.us-east-1.amazonaws.com/Test'
      const rootApiURL = 'https://qnsx3trrkj.execute-api.us-east-1.amazonaws.com/test'
      app.provide(injectionKey, rootApiURL)

      app.config.globalProperties.$rootApiURL = rootApiURL
  }
}