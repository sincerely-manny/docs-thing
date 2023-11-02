import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_SERVER}/${process.env.PG_DB}?sslmode=verify-full`;

export default {
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString,
    },
} satisfies Config;
