import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBekraftaBeslutStore = defineStore('bekraftaBeslut', () => {
  const bekraftad = ref(false);

  function setBekraftad(value: boolean) {
    bekraftad.value = value;
  }

  return { bekraftad, setBekraftad };
});