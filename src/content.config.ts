import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Fase 1: los proyectos viven en JSON. En Fase 2 se reemplaza el loader por el API del back-office.
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      type: z.enum(['Residencial', 'Empresa', 'Espacio público', 'Hospedaje']),
      location: z.string(),
      year: z.number(),
      areaM2: z.number(),
      client: z.string().optional(),
      scope: z.string(),
      summary: z.string(),
      body: z.array(z.string()),
      order: z.number(),
      featured: z.boolean().default(false),
      /** [lng, lat] para el mapa del estudio */
      coords: z.tuple([z.number(), z.number()]),
      cover: image(),
      gallery: z.array(z.object({ src: image(), alt: z.string() })),
      coverAlt: z.string(),
      beforeAfter: z
        .object({ before: image(), after: image(), alt: z.string(), demo: z.boolean().default(false) })
        .optional(),
    }),
});

export const collections = { projects };
