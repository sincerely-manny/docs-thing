<script lang="ts">
    import { Download } from 'lucide-svelte';
    import type { PageData } from './$types';
    import { Button } from 'flowbite-svelte';

    export let data: PageData;
</script>

<div class="flex flex-col items-start gap-4">
    <img src={`/invoice/pdf?invoiceId=${data.id}&return=image`} alt={data.id} class="max-w-60" />
    <a href={`/invoice/pdf?invoiceId=${data.id}`} target="_blank">
        <Button class="flex gap-1"><Download /> Download PDF</Button>
    </a>
</div>
