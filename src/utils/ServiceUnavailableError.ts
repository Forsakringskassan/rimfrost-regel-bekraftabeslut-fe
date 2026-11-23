/** BFF:en svarade 503 — tjänsten bakom den är inte tillgänglig just nu. */
export class ServiceUnavailableError extends Error {}

export const SERVICE_UNAVAILABLE_MESSAGE = 'Tjänsten är inte tillgänglig för tillfället. Försök igen senare.';

/** Kastar ServiceUnavailableError vid 503 och Error vid övriga svar som inte är ok. */
export function checkResponse(response: Response): void {
  if (response.status === 503) throw new ServiceUnavailableError();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
