<script lang="ts">
    import { Spinner } from 'flowbite-svelte';
    import { blur } from 'svelte/transition';

    let image: string | null = null;
    $: image;

    const preload = async (src: string): Promise<string> => {
        const resp = await fetch(src);
        const blob = await resp.blob();

        return new Promise(function (resolve, reject) {
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    export let src: string;
    export let alt: string;
</script>

{#await preload(src)}
    <span {...$$restProps}>
        <Spinner size="24" />
    </span>
{:then base64}
    <img transition:blur={{ amount: 20, duration: 300 }} src={base64} {alt} {...$$restProps} />
{/await}
