<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { FButton, FLoader, FSelectField, FStaticField, FTooltip } from '@fkui/vue';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import { fetchBeslutsdata } from '../utils/fetchBeslutsdata';
import { fetchReferensdata } from '../utils/fetchReferensdata';
import { bekraftaBeslut } from '../utils/bekraftaBeslut';
import { fetchUppgiftsbeskrivning } from '../utils/fetchUppgiftsbeskrivning';

const { handlaggningId } = defineProps<{
  handlaggningId: string;
}>();

const store = useBekraftaBeslutStore();
const isInfoLoading = ref(true);
const isDescriptionFetched = ref(false);

const selectedAvslutstyp = ref('');
const selectedBeslutstyp = ref('');
const selectedBeslutsutfall = ref('');

function onAvslutstyp(value: unknown) {
  console.log('[BekraftaBeslut] avslutstyp change, $event:', value);
  selectedAvslutstyp.value = String(value);
}
function onBeslutstyp(value: unknown) {
  console.log('[BekraftaBeslut] beslutstyp change, $event:', value);
  selectedBeslutstyp.value = String(value);
}
function onBeslutsutfall(value: unknown) {
  console.log('[BekraftaBeslut] beslutsutfall change, $event:', value);
  selectedBeslutsutfall.value = String(value);
}

const beslutComplete = computed(
  () => !!selectedAvslutstyp.value && !!selectedBeslutstyp.value && !!selectedBeslutsutfall.value,
);

const buttonDisabled = computed(
  () => store.submitting || store.bekraftad || !beslutComplete.value,
);

function handleTooltipOpen() {
  if (!isDescriptionFetched.value && !store.descriptionLoading) {
    isDescriptionFetched.value = true;
    fetchUppgiftsbeskrivning();
  }
}

function formatDate(value?: string) {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
}

onMounted(async () => {
  isInfoLoading.value = true;
  await Promise.all([fetchBeslutsdata(handlaggningId), fetchReferensdata()]);
  isInfoLoading.value = false;
});

onUnmounted(() => {
  store.setBekraftad(false);
});
</script>

<template>
  <div>
    <f-static-field>
      <template #label>Bekräfta beslut</template>
      <template #tooltip>
        <f-tooltip
          screen-reader-text="Läs mer om uppgiften bekräfta beslut"
          header-tag="h2"
          @toggle="handleTooltipOpen"
        >
          <template #header>Läs mer om uppgiften "Bekräfta beslut"</template>
          <template #body>
            <span v-if="store.descriptionLoading">
              <f-loader
                :show="store.descriptionLoading"
                :delay="true"
                style="margin-top: 2rem !important; min-height: 6.25rem;"
              >
                Vänligen vänta
              </f-loader>
            </span>
            <span v-else-if="store.uppgiftsbeskrivning">
              {{ store.uppgiftsbeskrivning }}
            </span>
            <span v-else>Ingen beskrivning tillgänglig.</span>
          </template>
        </f-tooltip>
      </template>
    </f-static-field>

    <f-loader
      :show="isInfoLoading"
      :delay="true"
      style="margin-top: 7rem !important; min-height: 6.25rem;"
    >
      Vänligen vänta
    </f-loader>

    <div v-if="!isInfoLoading && store.data" class="beslut-information">
      <f-static-field>
        <template #label><span>Kund</span></template>
        <template #default>
          <span>{{ store.data.kund.fornamn ?? "Jane" }} {{ store.data.kund.efternamn ?? "Doe" }}</span>
        </template>
      </f-static-field>

      <f-static-field>
        <template #label><span>Organisation</span></template>
        <template #default>
          <span>{{ store.data.kund.anstallning?.organisationsnamn || '-' }}</span>
        </template>
      </f-static-field>

      <div
        v-for="ers in store.data.ersattning"
        :key="ers.ersattningId"
        class="ersattning-rad"
      >
        <f-static-field>
          <template #label><span>Beslutsutfall</span></template>
          <template #default><span>{{ ers.beslutsutfall }}</span></template>
        </f-static-field>
        <f-static-field>
          <template #label><span>Period</span></template>
          <template #default>
            <span>{{ formatDate(ers.from) }} – {{ formatDate(ers.tom) }}</span>
          </template>
        </f-static-field>
        <f-static-field>
          <template #label><span>Belopp</span></template>
          <template #default><span>{{ ers.belopp }} kr</span></template>
        </f-static-field>
      </div>

      <f-select-field id="avslutstyp" :model-value="selectedAvslutstyp" @change="onAvslutstyp">
        <template #label>Avslutstyp</template>
        <option value="" disabled>Välj avslutstyp</option>
        <option v-for="item in store.avslutstyper" :key="item.id" :value="item.id">
          {{ item.namn }}
        </option>
      </f-select-field>

      <f-select-field id="beslutstyp" :model-value="selectedBeslutstyp" @change="onBeslutstyp">
        <template #label>Beslutstyp</template>
        <option value="" disabled>Välj beslutstyp</option>
        <option v-for="item in store.beslutstyper" :key="item.id" :value="item.id">
          {{ item.namn }}
        </option>
      </f-select-field>

      <f-select-field id="beslutsutfall" :model-value="selectedBeslutsutfall" @change="onBeslutsutfall">
        <template #label>Beslutsutfall</template>
        <option value="" disabled>Välj beslutsutfall</option>
        <option v-for="item in store.beslutsutfallstyper" :key="item.id" :value="item.id">
          {{ item.namn }}
        </option>
      </f-select-field>

      <p v-if="store.error" class="error-message">{{ store.error }}</p>

      <f-button
        :key="String(buttonDisabled)"
        :disabled="buttonDisabled"
        @click="bekraftaBeslut(handlaggningId, { avslutstyp: selectedAvslutstyp, beslutstyp: selectedBeslutstyp, beslutsutfall: selectedBeslutsutfall })"
      >
        {{ store.submitting ? 'Bekräftar...' : 'Bekräfta beslut' }}
      </f-button>
    </div>
  </div>
</template>

<style scoped>
.beslut-information {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.ersattning-rad {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
}

.error-message {
  color: red;
  font-size: 0.875rem;
}
</style>
