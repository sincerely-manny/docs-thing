<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import type { PageData } from './$types';
    import { Receipt, ExternalLink } from 'lucide-svelte';

    export let data: PageData;
</script>

<div class="flex flex-col">
    {#each data.clientsList as client}
        <div
            class="grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-2 transition-all even:bg-black/10 hover:bg-white/20"
        >
            <span>
                {client.name}, {client.opf}
            </span>
            <div>
                <Button
                    href={`/invoice/create?clientId=${client.id}`}
                    title="Create invoice"
                    class="gap-1 p-2"
                >
                    <Receipt size={18} />
                    Create invoice
                </Button>
            </div>
        </div>
    {/each}
</div>
