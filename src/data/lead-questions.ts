// Preguntas del formulario de contacto, en orden. Cada respuesta viaja al lead con su `key`.
// ⚠ Rangos de presupuesto y área: borrador; confirmar con el estudio antes del lanzamiento.

export interface Choice {
  label: string;
  hint?: string;
}

export interface Question {
  key: 'service' | 'space' | 'areaRange' | 'siteState' | 'timeline' | 'budget';
  title: string;
  note?: string;
  /** Etiqueta corta para el resumen del último paso. */
  short: string;
  choices: Choice[];
}

export const questions: Question[] = [
  {
    key: 'service',
    title: '¿Qué necesitas?',
    short: 'Servicio',
    choices: [
      { label: 'Construir desde cero', hint: 'Proyecto, licencia y obra hasta la entrega de llaves.' },
      { label: 'Construir con planos que ya tengo', hint: 'Ejecutamos tu proyecto con presupuesto por partidas.' },
      { label: 'Ampliar o remodelar', hint: 'Segundo piso, nueva distribución o renovación completa.' },
      { label: 'Supervisión de obra', hint: 'Controlamos calidad, plazos y avance de una obra en curso.' },
      { label: 'Solo el proyecto', hint: 'Arquitectura, especialidades y expediente para licencia.' },
      { label: 'Otra cosa' },
    ],
  },
  {
    key: 'space',
    title: '¿Para qué tipo de lugar?',
    short: 'Lugar',
    choices: [
      { label: 'Vivienda', hint: 'Casa, casa de playa o de campo.' },
      { label: 'Condominio o edificio', hint: 'Viviendas, áreas comunes, azoteas.' },
      { label: 'Empresa', hint: 'Oficinas, planta, clínica, colegio.' },
      { label: 'Hospedaje o restaurante' },
      { label: 'Espacio público', hint: 'Plazas, locales comunales, infraestructura municipal.' },
    ],
  },
  {
    key: 'areaRange',
    title: '¿Cuánto mide el área a trabajar?',
    note: 'Un aproximado basta; lo medimos en la visita.',
    short: 'Área',
    choices: [
      { label: 'Menos de 100 m²' },
      { label: '100 a 300 m²' },
      { label: '300 a 1 000 m²' },
      { label: '1 000 a 5 000 m²' },
      { label: 'Más de 5 000 m²' },
      { label: 'Todavía no lo sé' },
    ],
  },
  {
    key: 'siteState',
    title: '¿Cómo está el lugar hoy?',
    short: 'Estado',
    choices: [
      { label: 'Terreno vacío o de tierra' },
      { label: 'En obra', hint: 'Ya se está construyendo.' },
      { label: 'Ya está construido y quiero cambiarlo' },
      { label: 'Solo tengo planos' },
    ],
  },
  {
    key: 'timeline',
    title: '¿Cuándo te gustaría empezar?',
    short: 'Inicio',
    choices: [
      { label: 'Lo antes posible' },
      { label: 'En uno a tres meses' },
      { label: 'En tres a seis meses' },
      { label: 'Más adelante, estoy explorando' },
    ],
  },
  {
    key: 'budget',
    title: '¿Tienes un presupuesto en mente?',
    note: 'Nos ayuda a proponerte soluciones y materiales que calcen desde la primera visita.',
    short: 'Presupuesto',
    choices: [
      { label: 'Hasta S/ 100 000' },
      { label: 'S/ 100 000 a 300 000' },
      { label: 'S/ 300 000 a 800 000' },
      { label: 'Más de S/ 800 000' },
      { label: 'Prefiero conversarlo' },
    ],
  },
];

export const contactPrefs = ['WhatsApp', 'Llamada', 'Correo'] as const;

/** Tipo de proyecto del CRM (docs/02, enum ProjectType) a partir del lugar elegido. */
export const projectTypeFor: Record<string, string> = {
  Vivienda: 'Vivienda',
  'Condominio o edificio': 'Vivienda',
  Empresa: 'Empresa',
  'Hospedaje o restaurante': 'Hospedaje',
  'Espacio público': 'Espacio público',
};
