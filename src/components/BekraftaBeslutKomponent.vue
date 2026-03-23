<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FButton } from '@fkui/vue';

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
  console.log(`[fetchBeslutsdata] Hämtar beslutsdata för handlaggningId: ${props.handlaggningId}`);
  try {
    const response = await fetch(
      `${bffUrl}/api/regel/bekraftabeslut/${props.handlaggningId}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data.value = await response.json();
    console.log(`[fetchBeslutsdata] ✅ 200 OK — data hämtad:`, data.value);
  } catch (err) {
    error.value = 'Ett fel uppstod vid hämtning av beslutsdata';
    console.error(`[fetchBeslutsdata] ❌ Fel:`, err);
  } finally {
    loading.value = false;
  }
}

async function bekraftaBeslut() {
  if (!data.value?.ersattning) return;
  submitting.value = true;
  error.value = '';
  console.log(`[bekraftaBeslut] Startar bekräftelse för handlaggningId: ${props.handlaggningId}`);
  try {
    for (const ers of data.value.ersattning) {
      console.log(`[bekraftaBeslut] PATCH ersattning_id: ${ers.ersattning_id} → FASTSTALLT`);
      const response = await fetch(
        `${bffUrl}/api/regel/bekraftabeslut/${props.handlaggningId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ersattning_id: ers.ersattning_id,
            ersattningsstatus: 'FASTSTALLT',
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      console.log(`[bekraftaBeslut] ✅ ${response.status} OK — ersättning ${ers.ersattning_id} fastställd`);
    }
    bekraftad.value = true;
    console.log(`[bekraftaBeslut] ✅ Alla ersättningar fastställda — beslut bekräftat!`);
  } catch (err) {
    error.value = 'Ett fel uppstod vid bekräftelse av beslut';
    console.error(`[bekraftaBeslut] ❌ Fel:`, err);
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

      <table class="ersattning-table">
        <thead>
          <tr>
            <th>Typ</th>
            <th>Period</th>
            <th>Belopp</th>
            <th>Beslutsutfall</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ers in data.ersattning" :key="ers.ersattning_id">
            <td>{{ ers.ersattningstyp }}</td>
            <td>{{ ers.from }} – {{ ers.tom }}</td>
            <td>{{ ers.belopp }} kr</td>
            <td>{{ ers.beslutsutfall }}</td>
          </tr>
        </tbody>
      </table>

      <div class="actions">
        <FButton @click="bekraftaBeslut" :disabled="submitting || bekraftad">
          {{ submitting ? 'Bekräftar...' : 'Bekräfta beslut' }}
        </FButton>
      </div>
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
.ersattning-table {
  width: 100%;
  border-collapse: collapse;
  th, td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: left;
  }
}
</style>