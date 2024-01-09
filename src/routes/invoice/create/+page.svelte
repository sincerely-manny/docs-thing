<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import Datepicker from 'components/shared/form/Datepicker.svelte';
    import TextInput from 'components/shared/form/TextInput.svelte';
    import WithTooltip from 'components/shared/form/WithTooltip.svelte';
    import { Button, Dropdown, FloatingLabelInput, Helper, Radio } from 'flowbite-svelte';
    import { ChevronDownCircle, Save, UserPlus } from 'lucide-svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';

    export let data: PageData;

    const { form, errors } = superForm(data.form);

    let selectedClient: (typeof data.clients)[number]['id'] | undefined =
        $page.url.searchParams.get('clientId') || undefined;
    let selectClientOpen = !selectedClient;

    const servicesInputs = ['', ''];
</script>

<section class="flex justify-center">
    <form method="POST" class="flex w-[512px] flex-col gap-5" use:enhance>
        <div class="relative z-20">
            <Button class="flex w-full items-end justify-between">
                <div class="flex min-h-6 items-center justify-start">
                    {data.clients.find((client) => client.id === selectedClient)?.name ||
                        'Select a client'}
                </div>
                <ChevronDownCircle class="shrink-0" />
            </Button>
            <Dropdown
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
            </Dropdown>
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
        <div>
            <p class="mb-2">Services:</p>
            {#each servicesInputs as input, i}
                <div class="flex items-center justify-stretch gap-4">
                    <span>
                        #{i + 1}
                    </span>
                    <WithTooltip
                        value="11"
                        className="grow"
                        getSuggestions={() => [{ title: 'dasda', caption: '3211' }]}
                        onSuggestionClick={(e) => {}}
                    >
                        <TextInput {form} {errors} name={`service-title-${i}`} label="Title" />
                    </WithTooltip>
                    <TextInput {form} {errors} name={`service-price-${i}`} label="Price" />
                    <span>₽</span>
                </div>
            {/each}
        </div>
        <Button type="submit" class="flex gap-2">
            <Save />
            Submit
        </Button>
    </form>
</section>
