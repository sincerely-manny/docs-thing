import { sql } from 'drizzle-orm';
import { date, numeric, pgEnum, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const clientTypes = ['ИП', 'ООО', 'АО', 'ПАО', 'ФЛ'] as const;
const clientTypeEnum = pgEnum('clienttype', clientTypes);

export const clients = pgTable('clients', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .notNull()
        .primaryKey(),
    type: clientTypeEnum('type').notNull(),
    name: varchar('name').notNull(),
    ogrn: varchar('ogrn', { length: 13 }),
    inn: varchar('inn'),
    email: varchar('email'),
});

// export const clientsInsertSchema = z.object({
//     number: z.string().trim(),
//     type: z.enum(clientTypes),

// });

export const invoices = pgTable('invoices', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .notNull()
        .primaryKey(),
    number: varchar('number').notNull(),
    date: date('date').defaultNow(),
    createdAt: date('created_at', { mode: 'date' }).defaultNow(),
    clientId: uuid('client_id')
        .references(() => clients.id)
        .notNull(),
});

export const services = pgTable('services', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .notNull()
        .primaryKey(),
    description: text('description'),
    amount: numeric('amount', { precision: 20, scale: 2 }),
    invoiceId: uuid('invoice_id')
        .references(() => invoices.id)
        .notNull(),
});

export const payments = pgTable('payments', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .notNull()
        .primaryKey(),
    date: date('date').defaultNow(),
    amount: numeric('amount', { precision: 20, scale: 2 }),
    invoiceId: uuid('invoice_id').references(() => invoices.id),
    serviceId: uuid('service_id').references(() => services.id),
});

export default { clients, invoices, payments, services };
