import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_Cixvn12ydSzu@ep-shiny-meadow-b1tuc4qy-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require';

export function getSql() {
  const connString =
    (typeof process !== 'undefined' && (process.env?.DATABASE_URL || process.env?.VITE_DATABASE_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.DATABASE_URL || import.meta.env?.VITE_DATABASE_URL)) ||
    DEFAULT_DATABASE_URL;

  return neon(connString);
}
