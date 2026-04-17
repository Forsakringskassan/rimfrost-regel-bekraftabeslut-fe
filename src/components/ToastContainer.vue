<script setup lang="ts">
import { useToast } from '../utils/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="'toast--' + toast.type"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  padding: 1rem 2rem;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  min-width: 300px;
  animation: slideIn 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.toast--success { background: #227a52; }
.toast--error { background: #c53030; }
.toast--warning { background: #b7791f; }
.toast--info { background: #2b6cb0; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>