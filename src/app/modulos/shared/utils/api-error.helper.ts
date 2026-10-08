// Devuelve el primer error de validación de Laravel (422) o el mensaje general
export function extraerMensajeError(err: any, porDefecto: string): string {
  const errores = err?.error?.errors;
  if (errores && typeof errores === 'object') {
    const primero = Object.values(errores)[0];
    if (Array.isArray(primero) && primero.length > 0) {
      return String(primero[0]);
    }
  }
  return err?.error?.mensaje || err?.error?.message || porDefecto;
}