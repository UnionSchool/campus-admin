<script setup lang="ts">
import { computed } from '../../vue'
import { loadingStore } from '../../services/loading'
import { toastStore } from '../../services/toast'
import { overlayStore } from '../../services/modal'
import { useStore } from '../../services/use-store'
import CaLoadingOverlay from './ca-loading-overlay.vue'
import CaToastList from './ca-toast-list.vue'
import CaOverlayList from './ca-overlay-list.vue'

/**
 * 命令式 API 的渲染宿主。
 *
 * 由 createCampusAdmin 自动挂到应用根组件，业务方不需要手动引入。
 * 三个 store 各管一类弹层，互不干扰。
 */
defineOptions({ name: 'CaOverlayHost' })

const loading = useStore(loadingStore)
const toast = useStore(toastStore)
const overlay = useStore(overlayStore)

const loadingVisible = computed(() => loading.value.visible)
const loadingText = computed(() => loading.value.text)
</script>

<template>
  <CaLoadingOverlay :visible="loadingVisible" :text="loadingText" />
  <CaToastList :items="toast.list" />
  <CaOverlayList :items="overlay.list" />
</template>
