import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import { bffFetch } from './bffFetch';

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
    store.setDescriptionError(true);
  } finally {
    store.setDescriptionLoading(false);
  }
}
