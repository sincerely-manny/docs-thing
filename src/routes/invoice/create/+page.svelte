<script lang="ts">
    import { page } from '$app/stores';
    import {
        Button,
        Datepicker,
        Dropdown,
        FloatingLabelInput,
        Helper,
        Radio,
    } from 'flowbite-svelte';
    import { ChevronRightCircle, Save, UserPlus } from 'lucide-svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';

    export let data: PageData;

    const { form, errors } = superForm(data.form);
    let selectedClient: (typeof data.clients)[number]['id'] | undefined =
        $page.url.searchParams.get('clientId') || undefined;
    let selectClientOpen = !selectedClient;
</script>

<section class="flex justify-center">
    <form method="POST" class="flex w-[512px] flex-col gap-5">
        <div class="z-10 grid grid-cols-2 gap-5">
            <div class="z-20">
                <Button class="flex w-full justify-between">
                    {data.clients.find((client) => client.id === selectedClient)?.name ||
                        'Select a client'}
                    <ChevronRightCircle />
                </Button>
                <Dropdown
                    class="flex flex-col gap-2 p-4"
                    placement="right-start"
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
                </Dropdown>
            </div>
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
        </div>
        <Datepicker
            datepickerFormat="dd.mm.yyyy"
            datepickerTitle="Invoice date"
            name="date"
            bind:value={$form.date}
        />
        <Button type="submit" class="flex gap-2">
            <Save />
            Submit
        </Button>
    </form>
</section>
