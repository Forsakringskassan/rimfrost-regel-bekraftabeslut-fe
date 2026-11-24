<script setup lang="ts">
  import BekraftaBeslutKomponent from './components/BekraftaBeslutKomponent.vue';
  import ToastContainer from './components/ToastContainer.vue'
  import { env } from './config/env';

  const props = defineProps<{
    handlaggningId: string;
    authorization?: string | null;
  }>();

  const handlaggningId = props.handlaggningId || env.devHandlaggningId;
  const authorization = props.authorization ?? (env.devAuthorization || null);
</script>

<template>
  <ToastContainer />
  <div>
    <BekraftaBeslutKomponent :handlaggning-id="handlaggningId" :authorization="authorization" />
  </div>
</template>

<style scoped></style>