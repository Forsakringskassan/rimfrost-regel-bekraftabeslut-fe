import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import { bffFetch, SaknarBehorighetError, SAKNAR_BEHORIGHET_MEDDELANDE } from './bffFetch';

export async function fetchUppgiftsbeskrivning(): Promise<void> {
  const store = useBekraftaBeslutStore();
  store.setDescriptionLoading(true);
  try {
    const response = await bffFetch('/api/uppgiftsbeskrivning', {
      method: 'GET',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result && typeof result.beskrivning === 'string') {
      store.setUppgiftsbeskrivning(result.beskrivning);
    }
  } catch (err) {
    console.error('Error fetching description:', err);
    store.setUppgiftsbeskrivning('');
    // Tooltipen visar sitt eget fel; saknad eller avvisad token visas dessutom som
    // huvudfel, som för övriga anrop (BEKF-NFR-01.4).
    store.setDescriptionError(true);
    if (err instanceof SaknarBehorighetError) {
      store.setError(SAKNAR_BEHORIGHET_MEDDELANDE);
    }
  } finally {
    store.setDescriptionLoading(false);
  }
}
