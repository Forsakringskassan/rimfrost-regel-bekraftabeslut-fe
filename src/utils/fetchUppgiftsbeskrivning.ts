import { env, ensureEnvLoaded } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';

export async function fetchUppgiftsbeskrivning(): Promise<void> {
  const store = useBekraftaBeslutStore();
  store.setDescriptionLoading(true);
  try {
    await ensureEnvLoaded();
    const response = await fetch(`${env.bffUrl}/api/uppgiftsbeskrivning`, {
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
