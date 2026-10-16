// ⚠ Datos de muestra: confirmar con el cliente antes del lanzamiento (docs/03, «Lo que necesitamos del cliente»).
export const site = {
  name: 'Ko-Sama',
  tagline: 'Arquitectos del paisaje',
  founded: 2014,
  city: 'Chiclayo',
  phone: '+51 999 999 999',
  whatsapp: '51999999999',
  email: 'hola@kosama.pe',
  address: 'Chiclayo, Lambayeque, Perú',
  hours: 'Lunes a sábado, 9:00 a 18:00',
  instagram: 'https://instagram.com/kosama.pe',
  leadsEndpoint: import.meta.env.PUBLIC_LEADS_ENDPOINT ?? '/api/leads',
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
