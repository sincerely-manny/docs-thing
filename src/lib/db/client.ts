import { PG_USER, PG_PASSWORD, PG_SERVER, PG_DB } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import schema from './schema';

export const queryClient = postgres(
    `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_SERVER}/${PG_DB}?sslmode=verify-full`,
);
export const migrationClient = postgres(
    `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_SERVER}/${PG_DB}?sslmode=verify-full`,
    { max: 1 },
);

export const db = drizzle(queryClient, { schema });

export default db;
