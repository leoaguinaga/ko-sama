// ⚠ Datos de muestra: confirmar con el cliente antes del lanzamiento (docs/03, «Lo que necesitamos del cliente»).
export const site = {
  name: 'Ko-Sama',
  tagline: 'Arquitectos del paisaje',
  founded: 2014,
  city: 'Chiclayo',
  phone: '+51 978 100 062',
  whatsapp: '51978100062',
  email: 'hola@ko-sama.com',
  address: 'Chiclayo, Lambayeque, Perú',
  hours: 'Lunes a sábado, 9:00 a 18:00',
  instagram: 'https://instagram.com/kosama.pe',
  leadsEndpoint: import.meta.env.PUBLIC_LEADS_ENDPOINT ?? '/api/leads',
};

// ⚠ Titular del banco de datos para la política de privacidad (Ley 29733). Falta del cliente:
//   razón social, RUC y domicilio fiscal. Mientras sean null, la página no los muestra.
//   `retentionMonths`: plazo de conservación de leads que no contratan; borrador a confirmar.
export const legal = {
  businessName: null as string | null,
  ruc: null as string | null,
  fiscalAddress: null as string | null,
  privacyEmail: site.email,
  retentionMonths: 24,
  privacyUpdated: '2026-10-16',
};

export const whatsappLink = (text = 'Hola Ko-Sama, quiero conversar sobre un proyecto.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const stats = [
  { label: 'Años de obra', value: '10+' },
  { label: 'Obras entregadas', value: '120' },
  { label: 'Metros cuadrados diseñados', value: '85 000' },
  { label: 'Provincias de Lambayeque', value: '3' },
];

export const clients = [
  { group: 'Viviendas', names: ['Familia Delgado', 'Familia Urbina', 'Residencial La Pradera', 'Condominio Los Sauces', 'Casa Pimentel Sur'] },
  { group: 'Empresas', names: ['Agroexportadora del Norte', 'Clínica del Pacífico', 'Hotel Costa del Sol', 'Grupo Inmobiliario Sipán', 'Colegio San Agustín'] },
  { group: 'Instituciones', names: ['Municipalidad de Pimentel', 'Universidad del Norte', 'Gobierno Regional de Lambayeque', 'Parroquia Santa María'] },
];

export const process = [
  { lead: 'Primero, el terreno.', text: 'Visitamos el lugar, medimos, leemos el suelo, el sol de la tarde y el agua que de verdad hay. Sin esto no se dibuja nada.' },
  { lead: 'Después, el proyecto.', text: 'Anteproyecto con especies, materiales y recorridos; presupuesto por partidas y planos para que sepas qué se construye y cuánto cuesta.' },
  { lead: 'Al final, la obra.', text: 'Ejecutamos con nuestro equipo, instalamos el riego y te entregamos un plan de mantenimiento para que el jardín mejore con los años.' },
];

// ⚠ Fundador: el público lo reconoce más por su nombre que por la marca. Falta del cliente:
//   - retrato (vertical 4:5, luz natural, idealmente en obra) → `portrait`
//   - formación y trayectoria para un tercer párrafo de `bio`
// Mientras no haya retrato, la página muestra una obra suya con pie de foto.
export const founder = {
  name: 'Jorge Guerrero',
  firstName: 'Jorge',
  title: 'Arquitecto',
  portrait: null as ImageMetadata | null,
  portraitAlt: 'Retrato de Jorge Guerrero',
  bio: [
    'Cuando en Chiclayo alguien recomienda a quién encargarle un jardín, casi siempre dice un nombre: el de Jorge.',
    'Jorge Guerrero es arquitecto y fundó Ko-Sama en 2014. Desde entonces proyecta los jardines, patios y espacios públicos del estudio y acompaña cada obra hasta la entrega: el criterio de la primera visita llega hasta el último riego.',
  ],
};
