import { defineStore } from 'pinia';
import { ref } from 'vue';

// Typerna speglar rimfrost-regel-bekraftabeslut-bff-openapi (openapi.yaml) en-till-en,
// inklusive snake_case i fältnamnen — BFF-svaret läggs i storen utan mappning.

export interface Anstallning {
  organisationsnummer?: string;
  organisationsnamn?: string;
  arbetstid_procent?: number;
  anstallningsdag?: string;
  sista_anstallningsdag?: string | null;
}

export interface Kund {
  fornamn: string;
  efternamn: string;
  kon: 'MAN' | 'KVINNA';
  anstallning: Anstallning;
}

export interface Ersattning {
  ersattning_id: string;
  ersattningstyp: string;
  omfattning_procent: number;
  belopp: number;
  berakningsgrund: number;
  beslutsutfall?: 'JA' | 'NEJ' | 'FU';
  avslagsanledning?: string | null;
  from: string;
  tom: string;
}

export interface GetDataResponse {
  handlaggning_id: string;
  kund: Kund;
  ersattning: Ersattning[];
}

export interface Referensdata {
  id?: string;
  kod?: string;
  namn?: string;
}

export interface BeslutSelection {
  avslutstyp: string;
  beslutstyp: string;
  beslutsutfall: string;
}

/** Yrkandestatusen "fastställt" (med id, så att den kan skickas i PATCH), eller undefined. */
export function hittaFaststalltStatus(
  yrkandestatusar: Referensdata[],
): (Referensdata & { id: string }) | undefined {
  return yrkandestatusar.find(
    (s): s is Referensdata & { id: string } => !!s.id && s.kod?.toLowerCase() === 'faststallt',
  );
}

export const useBekraftaBeslutStore = defineStore('bekraftaBeslut', () => {
  const data = ref<GetDataResponse | null>(null);
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

  function setData(value: GetDataResponse | null) {
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
