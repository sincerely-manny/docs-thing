import { sql } from 'drizzle-orm';
import { date, numeric, pgEnum, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const clientTypes = ['ИП', 'ООО', 'АО', 'ПАО', 'ФЛ'] as const;
// const clientTypeEnum = pgEnum('clienttype', clientTypes);

export const clients = pgTable('clients', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .notNull()
        .primaryKey(),
    opf: varchar('opf').notNull(),
    name: varchar('name').notNull(),
    ogrn: varchar('ogrn'),
    inn: varchar('inn'),
    email: varchar('email'),
    address: varchar('address'),
});

export const clientsInsertSchema = z
    .object({
        opf: z.string(),
        name: z.string().trim().min(2),
        ogrn: z
            .string()
            .min(13)
            .max(15)
            .regex(/^[0-9]*$/)
            .optional(),
        inn: z
            .string()
            .min(10)
            .max(12)
            .regex(/^[0-9]*$/)
            .optional(),
        address: z.string().trim().min(2).optional(),
        email: z.string().trim().email().optional(),
    })
    .refine(({ inn, opf }) => opf === 'ФЛ' || inn, {
        message: 'Для ЮЛ/ИП должен быть указан ИНН',
        path: ['inn'],
    })
    .refine(({ ogrn, opf }) => opf === 'ФЛ' || ogrn, {
        message: 'Для ЮЛ/ИП должен быть указан ОГРН',
        path: ['ogrn'],
    });

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
