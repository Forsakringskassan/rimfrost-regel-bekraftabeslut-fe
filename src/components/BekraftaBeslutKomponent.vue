<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FButton, FCard } from '@fkui/vue';

interface Ersattning {
  ersattning_id: string;
  ersattningstyp: string;
  omfattning_procent: number;
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
    arbetstid_procent: number;
    lon?: { lonesumma: number };
  };
}

interface GetDataResponse {
  handlaggning_id: string;
  kund: Kund;
  ersattning: Ersattning[];
}

const props = defineProps<{
  handlaggningId: string;
}>();

const loading = ref(false);
const submitting = ref(false);
const error = ref('');
const data = ref<GetDataResponse | null>(null);
const bekraftad = ref(false);

const bffUrl = import.meta.env.VITE_BFF_URL || 'http://localhost:9003';

async function fetchBeslutsdata() {
  loading.value = true;
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
    loading.value = false;
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
            ersattning_id: item.ersattning_id,
            ersattningsstatus: 'FASTSTALLT',
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    }
    bekraftad.value = true;
  } catch (err) {
    error.value = 'Ett fel uppstod vid bekräftelse av beslut';
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchBeslutsdata();
});
</script>

<template>
  <div class="container">
    <p v-if="loading">Laddar beslutsdata...</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="bekraftad" class="success">Beslut bekräftat!</p>

    <div v-if="data">
      <h2>{{ data.kund.fornamn }} {{ data.kund.efternamn }}</h2>
      <p v-if="data.kund.anstallning">
        Arbetsgivare: {{ data.kund.anstallning.organisationsnamn }} —
        {{ data.kund.anstallning.arbetstid_procent }}%
      </p>

      <f-card>
        <template #header="{ headingSlotClass }">
          <h3 :class="headingSlotClass">Beslutsdata</h3>
        </template>
        <template #default>
          <p v-for="item in data.ersattning" :key="item.ersattning_id">
            Typ: {{ item.ersattningstyp }}<br />
            Period: {{ item.from }} – {{ item.tom }}<br />
            Belopp: {{ item.belopp }} kr<br />
            Beslutsutfall: {{ item.beslutsutfall }}
          </p>
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
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>