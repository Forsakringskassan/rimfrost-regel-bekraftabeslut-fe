import { env, ensureEnvLoaded } from '../config/env';
import { hittaFaststalltStatus, useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import type { BeslutSelection } from '../stores/BekraftaBeslutStore';
import { checkResponse, ServiceUnavailableError, SERVICE_UNAVAILABLE_MESSAGE } from './ServiceUnavailableError';

export async function bekraftaBeslut(handlaggningId: string, beslut: BeslutSelection): Promise<void> {
  const store = useBekraftaBeslutStore();

  if (!store.data?.ersattning) {
    store.setError('Ingen ersättningsdata tillgänglig');
    return;
  }

  const faststalltStatus = hittaFaststalltStatus(store.yrkandestatusar);
  if (!faststalltStatus) {
    store.setError('Kunde inte hitta yrkandestatus "faststallt" i referensdata');
    return;
  }

  store.setSubmitting(true);
  store.setError('');

  try {
    await ensureEnvLoaded();
    const patchResponse = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut/${handlaggningId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ersattningar: store.data.ersattning.map((item) => ({
          ersattning_id: item.ersattning_id,
          yrkandestatus: faststalltStatus.id,
        })),
        beslut,
      }),
    });
    checkResponse(patchResponse);
  } catch (err) {
    console.error('Error patching ersattningar:', err);
    store.setError(
      err instanceof ServiceUnavailableError
        ? SERVICE_UNAVAILABLE_MESSAGE
        : 'Ett fel uppstod vid uppdatering av ersättningsdata.',
    );
    store.setSubmitting(false);
    return;
  }

  try {
    const doneResponse = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut/done`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handlaggningId }),
    });
    checkResponse(doneResponse);

    store.setBekraftad(true);
    window.dispatchEvent(
      new CustomEvent('task-done', {
        detail: { handlaggningId, success: true, message: 'Beslut bekräftat' },
      }),
    );
  } catch (err) {
    console.error('Error confirming decision:', err);
    store.setError(
      err instanceof ServiceUnavailableError
        ? SERVICE_UNAVAILABLE_MESSAGE
        : 'Ett fel uppstod vid bekräftelse av beslut',
    );
  } finally {
    store.setSubmitting(false);
  }
}
