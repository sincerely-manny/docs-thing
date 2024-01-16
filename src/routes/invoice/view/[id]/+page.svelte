<script lang="ts">
    import { Download } from 'lucide-svelte';
    import type { PageData } from './$types';
    import { Button } from 'flowbite-svelte';
    import Image from 'components/shared/Image.svelte';

    export let data: PageData;
</script>

<div class="flex justify-center">
    <div class="relative inline-block h-[700px] overflow-hidden rounded">
        <!-- <img src={`/api?invoiceId=${data.id}&ppi=72`} alt={data.id} class="h-full object-fill" /> -->
        <Image
            src={`/api/png?invoiceId=${data.id}&ppi=72`}
            alt={data.id}
            class="flex h-full items-center justify-center object-fill"
        />
        <div class="absolute bottom-3 left-0 flex w-full justify-center">
            <a href={`/invoice/pdf?invoiceId=${data.id}`} target="_blank">
                <Button class="flex gap-1"><Download /> Download PDF</Button>
            </a>
        </div>
    </div>
</div>
