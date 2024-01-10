<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import Datepicker from 'components/shared/form/Datepicker.svelte';
    import TextInputsArray from 'components/shared/form/TextInputsArray.svelte';
    import { Button, Dropdown, FloatingLabelInput, Helper, Radio } from 'flowbite-svelte';
    import { ChevronDownCircle, Save, UserPlus } from 'lucide-svelte';
    import { blur } from 'svelte/transition';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';

    export let data: PageData;

    const { form, errors } = superForm(data.form);

    let selectedClient: (typeof data.clients)[number]['id'] | undefined =
        $page.url.searchParams.get('clientId') || undefined;
    let selectClientOpen = !selectedClient;

    let services = [{ title: '', price: '' }];
</script>

<section class="flex justify-center">
    <form method="POST" class="flex w-[512px] flex-col gap-5" use:enhance>
        <div class="relative z-20">
            <Button
                class="flex w-full items-end justify-between"
                on:click={() => {
                    selectClientOpen = !selectClientOpen;
                }}
            >
                <div class="flex min-h-6 items-center justify-start">
                    {data.clients.find((client) => client.id === selectedClient)?.name ||
                        'Select a client'}
                </div>
                <ChevronDownCircle class="shrink-0" />
            </Button>
            {#if selectClientOpen}
                <div
                    role="tooltip"
                    transition:blur={{ amount: 20, duration: 300 }}
                    class="absolute mt-2 flex max-h-96 w-full flex-col gap-2 overflow-scroll rounded-lg bg-slate-700 p-4"
                >
                    {#each data.clients as client}
                        <Radio
                            name="clientsGroup"
                            bind:group={selectedClient}
                            value={client.id}
                            on:change={() => (selectClientOpen = false)}
                            class="cursor-pointer"
                        >
                            {client.name}, {client.opf}
                        </Radio>
                    {/each}
                    <a href="/client/create?ref=/invoice/create">
                        <Button color="alternative" size="xs" class="flex gap-1">
                            <UserPlus size="16" />
                            Create new
                        </Button>
                    </a>
                </div>
            {/if}
            <!-- <Dropdown
                class="flex w-full flex-col gap-2 p-4"
                placement="bottom"
                containerClass="bg-slate-500"
                bind:open={selectClientOpen}
            >
                {#each data.clients as client}
                    <li class="">
                        <Radio
                            name="clientsGroup"
                            bind:group={selectedClient}
                            value={client.id}
                            on:change={() => (selectClientOpen = false)}
                            class="cursor-pointer"
                        >
                            {client.name}, {client.opf}
                        </Radio>
                    </li>
                {/each}
                <a href="/client/create?ref=/invoice/create">
                    <Button color="alternative" size="xs" class="flex gap-1">
                        <UserPlus size="16" />
                        Create new
                    </Button>
                </a>
            </Dropdown> -->
        </div>
        <div class="z-10 grid grid-cols-2 gap-5">
            <div>
                <FloatingLabelInput
                    type="number"
                    name="number"
                    bind:value={$form.number}
                    color={$errors.number ? 'red' : 'base'}
                >
                    Invoice #
                </FloatingLabelInput>
                <Helper color="red">{$errors.number || ''}&nbsp;</Helper>
            </div>
            <Datepicker {form} {errors} name="date" label="Date" />
        </div>
        <TextInputsArray {errors} name="services" bind:value={services}>Services:</TextInputsArray>
        <Button type="submit" class="flex gap-2">
            <Save />
            Submit
        </Button>
    </form>
</section>
