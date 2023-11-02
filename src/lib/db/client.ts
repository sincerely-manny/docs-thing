import { PG_USER, PG_PASSWORD, PG_SERVER, PG_DB } from '$env/static/private';
import postgres from 'postgres';

export const queryClient = postgres(
    `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_SERVER}/${PG_DB}?sslmode=verify-full`,
);
export const migrationClient = postgres(
    `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_SERVER}/${PG_DB}?sslmode=verify-full`,
    { max: 1 },
);
