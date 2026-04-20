<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FButton, FCard, FStaticField, FTooltip, FLoader } from '@fkui/vue';
import { env } from '../config/env';

interface Ersattning {
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

interface Kund {
  efternamn: string;
  fornamn: string;
  kon: 'MAN' | 'KVINNA';
  anstallning?: {
    organisationsnamn: string;
    arbetstidProcent: number;
  };
}

interface GetDataResponse {
  handlaggningId: string;
  kund: Kund;
  ersattning: Ersattning[];
}

const props = defineProps<{
  handlaggningId: string;
}>();

const isInfoLoading = ref(true);
const submitting = ref(false);
const error = ref('');
const data = ref<GetDataResponse | null>(null);
const bekraftad = ref(false);

const descriptionLoading = ref(false);
const isDescriptionFetched = ref(false);
const uppgiftsbeskrivning = ref('');

const bffUrl = env.bffUrl;

const handleTooltipOpen = async () => {
  if (isDescriptionFetched.value || descriptionLoading.value) {
    return;
  }
  isDescriptionFetched.value = true;
  descriptionLoading.value = true;
  try {
    const response = await fetch(`${bffUrl}/api/uppgiftsbeskrivning/BEKRAFTABESLUT`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result && typeof result.beskrivning === 'string') {
      uppgiftsbeskrivning.value = result.beskrivning;
    }
  } catch (err) {
    console.error('Error fetching description:', err);
    uppgiftsbeskrivning.value = '';
  } finally {
    descriptionLoading.value = false;
  }
};

async function fetchBeslutsdata() {
  isInfoLoading.value = true;
  error.value = '';
  try {
    const response = await fetch(
      `${bffUrl}/api/regel/bekraftabeslut/${props.handlaggningId}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data.value = await response.json();
  } catch (err) {
    error.value = 'Ett fel uppstod vid hämtning av beslutsdata';
  } finally {
    isInfoLoading.value = false;
  }
}

async function bekraftaBeslut() {
  if (!data.value?.ersattning) {
    error.value = 'Ingen ersättningsdata tillgänglig';
    return;
  }
  submitting.value = true;
  error.value = '';
  try {
    for (const item of data.value.ersattning) {
      const response = await fetch(
        `${bffUrl}/api/regel/bekraftabeslut/${props.handlaggningId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ersattningId: item.ersattningId,
            yrkandestatus: 'FASTSTALLT',
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    }
    const doneResponse = await fetch(
      `${bffUrl}/api/regel/bekraftabeslut/${props.handlaggningId}/done`,
      { method: 'POST' }
    );
    if (!doneResponse.ok) throw new Error(`HTTP ${doneResponse.status}`);
    bekraftad.value = true;
    window.dispatchEvent(new CustomEvent('task-done', {
      detail: { handlaggningId: props.handlaggningId },
    }));
  } catch (err) {
    error.value = 'Ett fel uppstod vid bekräftelse av beslut';
  } finally {
    submitting.value = false;
  }
}

function formatIsoDateToYmd(value?: string) {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
}

onMounted(async () => {
  await fetchBeslutsdata();
});
</script>

<template>
  <div class="container">
    <div>
      <f-static-field>
        <template #label>
          Mer information om att bekräfta beslut
        </template>
        <template #tooltip>
          <f-tooltip
            screen-reader-text="Läs mer om uppgiften bekräfta beslut"
            header-tag="h2"
            @toggle="handleTooltipOpen"
          >
            <template #header>
              Läs mer om uppgiften "Bekräfta beslut"
            </template>
            <template #body>
              <span v-if="descriptionLoading">
                <f-loader :show="descriptionLoading" :delay="true" style="margin-top: 2rem !important; min-height: 6.25rem;">
                  Vänligen vänta
                </f-loader>
              </span>
              <span v-else-if="uppgiftsbeskrivning">
                {{ uppgiftsbeskrivning }}
              </span>
              <span v-else>
                Ingen beskrivning tillgänglig.
              </span>
            </template>
          </f-tooltip>
        </template>
      </f-static-field>
    </div>
    <div>
      <f-loader :show="isInfoLoading" :delay="true" style="margin-top: 7rem !important; min-height: 6.25rem;">
        Vänligen vänta
      </f-loader>
      <div v-if="!isInfoLoading">
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="bekraftad" class="success">Beslut bekräftat!</p>

        <h2 v-if="data" style="margin: 0rem 0 0.75rem !important;">Resultat {{ data.ersattning[0]?.ersattningstyp }}</h2>

        <section v-if="data" class="kund-section">
          <f-static-field>
            <template #label>
              <span>Kund</span>
            </template>
            <template #default>
              <span>{{ data.kund.fornamn }} {{ data.kund.efternamn }}</span>
            </template>
          </f-static-field>

          <f-static-field>
            <template #label>
              <span>Organisation</span>
            </template>
            <template #default>
              <span>{{ data.kund.anstallning?.organisationsnamn || '-' }}</span>
            </template>
          </f-static-field>
        </section>

        <f-card v-if="data" v-for="ers in data.ersattning" :key="ers.ersattningId" style="max-width: 50% !important;">
          <template #default>
            <p>Beslutsutfall: <span style="font-weight: 700">{{ ers.beslutsutfall }}</span></p>
            <p>
              Period:
              <span style="font-weight: 700">{{ formatIsoDateToYmd(ers.from) }} - {{ formatIsoDateToYmd(ers.tom) }}</span>
            </p>
            <p>Belopp: <span style="font-weight: 700">{{ ers.belopp }} kr</span></p>
          </template>

          <template #footer>
            <div class="actions">
              <FButton @click="bekraftaBeslut" :disabled="submitting || bekraftad">
                {{ submitting ? 'Bekräftar...' : 'Bekräfta beslut' }}
              </FButton>
            </div>
          </template>
        </f-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 1rem;
}
.kund-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}
.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0 !important;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>