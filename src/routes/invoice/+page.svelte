<script lang="ts">
    import { dateToString } from '$lib/pdf/utils';
    import type { PageData } from './$types';

    export let data: PageData;

    const { invoices } = data;
</script>

{#each invoices as invoice}
    <a href={`/invoice/view/${invoice.id}`}>
        # {invoice.number} от {dateToString(new Date(invoice.date || ''))} ({invoice.client?.name})
    </a> <br />
{/each}
