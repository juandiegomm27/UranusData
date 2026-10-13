export const ESTADO_ELEMENTO = {
  ACTIVO: 1,
  EN_PRESTAMO: 2,
  MANTENIMIENTO: 3,
  BAJA: 4
} as const;

// Clases de modules-badges.css (En préstamo usa el azul de "estado-devuelto")
const CLASE_ESTADO_ELEMENTO: Record<number, string> = {
  [ESTADO_ELEMENTO.ACTIVO]: 'estado-activo',
  [ESTADO_ELEMENTO.EN_PRESTAMO]: 'estado-devuelto',
  [ESTADO_ELEMENTO.MANTENIMIENTO]: 'estado-pendiente',
  [ESTADO_ELEMENTO.BAJA]: 'estado-baja'
};

export function claseEstadoElemento(cod: number | string): string {
  return CLASE_ESTADO_ELEMENTO[Number(cod)] ?? 'estado-inactivo';
}

// Tipos de movimiento del historial (clases de modules-badges.css)
const TIPO_MOVIMIENTO: Record<string, { etiqueta: string; clase: string }> = {
  alta: { etiqueta: 'Alta', clase: 'estado-activo' },
  edicion: { etiqueta: 'Edición', clase: 'estado-devuelto' },
  estado: { etiqueta: 'Estado', clase: 'estado-pendiente' },
  traslado: { etiqueta: 'Traslado', clase: 'estado-devuelto' },
  vinculo: { etiqueta: 'Vínculo', clase: 'estado-devuelto' },
  baja: { etiqueta: 'Baja', clase: 'estado-baja' },
  restauracion: { etiqueta: 'Restauración', clase: 'estado-activo' }
};

export function etiquetaTipoMovimiento(tipo: string): string {
  return TIPO_MOVIMIENTO[tipo]?.etiqueta ?? tipo;
}

export function claseTipoMovimiento(tipo: string): string {
  return TIPO_MOVIMIENTO[tipo]?.clase ?? 'estado-inactivo';
}