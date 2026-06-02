import { env } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';

export async function fetchUppgiftsbeskrivning(): Promise<void> {
  const store = useBekraftaBeslutStore();
  store.setDescriptionLoading(true);
  try {
    const response = await fetch(`${env.bffUrl}/api/uppgiftsbeskrivning/BEKRAFTABESLUT`, {
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
  } finally {
    store.setDescriptionLoading(false);
  }
}
