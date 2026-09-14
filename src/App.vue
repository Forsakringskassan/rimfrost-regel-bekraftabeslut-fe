<script setup lang="ts">
  import BekraftaBeslutKomponent from './components/BekraftaBeslutKomponent.vue';
  import ToastContainer from './components/ToastContainer.vue'
  import { env } from './config/env';

  const props = defineProps<{
    handlaggningId: string;
  }>();

  const handlaggningId = props.handlaggningId || env.devHandlaggningId;
</script>

<template>
  <ToastContainer />
  <div>
    <BekraftaBeslutKomponent :handlaggning-id="handlaggningId" />
  </div>
</template>

<style scoped></style>