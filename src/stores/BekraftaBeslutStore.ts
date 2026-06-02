import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Ersattning {
  ersattningId: string;
  ersattningstyp: string;
  omfattningProcent: number;
  belopp: number;
  berakningsgrund: number;
  beslutsutfall: 'JA' | 'NEJ' | 'FU';
  avslagsanledning?: string;
  from: string;
  tom: string;
}

export interface Kund {
  fornamn: string;
  efternamn: string;
  kon: 'MAN' | 'KVINNA';
  anstallning?: {
    organisationsnamn: string;
    arbetstidProcent: number;
  };
}

export interface BeslutsData {
  handlaggningId: string;
  kund: Kund;
  ersattning: Ersattning[];
}

export const useBekraftaBeslutStore = defineStore('bekraftaBeslut', () => {
  const data = ref<BeslutsData | null>(null);
  const bekraftad = ref(false);
  const submitting = ref(false);
  const error = ref('');
  const uppgiftsbeskrivning = ref('');
  const descriptionLoading = ref(false);

  function setData(value: BeslutsData | null) {
    data.value = value;
  }

  function setBekraftad(value: boolean) {
    bekraftad.value = value;
  }

  function setSubmitting(value: boolean) {
    submitting.value = value;
  }

  function setError(value: string) {
    error.value = value;
  }

  function setUppgiftsbeskrivning(value: string) {
    uppgiftsbeskrivning.value = value;
  }

  function setDescriptionLoading(value: boolean) {
    descriptionLoading.value = value;
  }

  return {
    data,
    bekraftad,
    submitting,
    error,
    uppgiftsbeskrivning,
    descriptionLoading,
    setData,
    setBekraftad,
    setSubmitting,
    setError,
    setUppgiftsbeskrivning,
    setDescriptionLoading,
  };
});
