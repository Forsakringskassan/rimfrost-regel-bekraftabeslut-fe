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

export interface Referensdata {
  id: string;
  kod: string;
  namn: string;
}

export interface BeslutSelection {
  avslutstyp: string;
  beslutstyp: string;
  beslutsutfall: string;
}

export const useBekraftaBeslutStore = defineStore('bekraftaBeslut', () => {
  const data = ref<BeslutsData | null>(null);
  const bekraftad = ref(false);
  const submitting = ref(false);
  const error = ref('');
  const uppgiftsbeskrivning = ref('');
  const descriptionLoading = ref(false);
  const descriptionError = ref(false);

  const avslutstyper = ref<Referensdata[]>([]);
  const beslutstyper = ref<Referensdata[]>([]);
  const beslutsutfallstyper = ref<Referensdata[]>([]);
  const yrkandestatusar = ref<Referensdata[]>([]);

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

  function setDescriptionError(value: boolean) {
    descriptionError.value = value;
  }

  function setReferensdata(
    avslutstyperVal: Referensdata[],
    beslutstyperVal: Referensdata[],
    beslutsutfallstyperVal: Referensdata[],
    yrkandestatusarVal: Referensdata[],
  ) {
    avslutstyper.value = avslutstyperVal;
    beslutstyper.value = beslutstyperVal;
    beslutsutfallstyper.value = beslutsutfallstyperVal;
    yrkandestatusar.value = yrkandestatusarVal;
  }

  return {
    data,
    bekraftad,
    submitting,
    error,
    uppgiftsbeskrivning,
    descriptionLoading,
    descriptionError,
    avslutstyper,
    beslutstyper,
    beslutsutfallstyper,
    yrkandestatusar,
    setData,
    setBekraftad,
    setSubmitting,
    setError,
    setUppgiftsbeskrivning,
    setDescriptionLoading,
    setDescriptionError,
    setReferensdata,
  };
});
