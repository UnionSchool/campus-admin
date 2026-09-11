import CaToastContainer from './src/toast-container.vue'

export { CaToastContainer }
export { clear as clearToasts, close as closeToast, toast } from './src/store'
export type { ToastItem, ToastOptions, ToastTone } from './src/store'
export default CaToastContainer
