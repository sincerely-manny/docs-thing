<script>
    import { Button } from 'flowbite-svelte';
    import { FilePlus2 } from 'lucide-svelte';
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<section>
    <a href="/invoice/create">
        <Button class="flex gap-1">
            <FilePlus2 />
            Create invoice
        </Button>
    </a>
</section>
