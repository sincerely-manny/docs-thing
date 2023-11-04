<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';
    import {
        Button,
        Dropdown,
        Input,
        Label,
        Listgroup,
        ListgroupItem,
        Radio,
        Spinner,
    } from 'flowbite-svelte';
    import type { ResDTO } from 'lib/dadata/types';
    import throttle from 'lodash.throttle';

    export let data: PageData;
    const { form } = superForm(data.form);
    const searchOptions = ['ФЛ', 'ЮЛ/ИП'];
    let selectedSearchOption = searchOptions[1];
    let nameFieldIsFocused = false;
    let namesearchDropdpwnIsOpen = false;
    $: namesearchDropdpwnIsOpen =
        nameFieldIsFocused && selectedSearchOption === searchOptions[1] && $form.name.length >= 2;

    let suggestedOrgs: ResDTO | null = null;
    const setSuggestedOrgs = throttle(async () => {
        suggestedOrgs = await (await fetch(`/api/search-organisation?query=${$form.name}`)).json();
    }, 2500);
    $: $form.name.length >= 2 &&
        (() => {
            suggestedOrgs = null;
            setSuggestedOrgs();
        })();
</script>

<section>
    <form method="POST" class="flex max-w-lg flex-col gap-5">
        <div>
            {#each searchOptions as option}
                <Radio
                    bind:group={selectedSearchOption}
                    inline
                    value={option}
                    class="mr-2 text-white"
                >
                    {option}
                </Radio>
            {/each}
        </div>
        <Label class="flex place-items-center">
            <span class="w-24 text-white">Name:</span>
            <Input
                type="text"
                name="name"
                bind:value={$form.name}
                on:focus={() => (nameFieldIsFocused = true)}
                on:blur={() => (nameFieldIsFocused = false)}
            />
        </Label>
        <div></div>
        <Dropdown bind:open={namesearchDropdpwnIsOpen} class="max-w-lg">
            {#if !suggestedOrgs}
                <Spinner />
            {:else if suggestedOrgs.suggestions.length === 0}
                no results
            {:else}
                <Listgroup active>
                    {#each suggestedOrgs.suggestions as org}
                        <ListgroupItem>
                            <div class="flex flex-col items-start gap-1 font-normal">
                                <h3 class="font-semibold">{org.data.name.full_with_opf}</h3>
                                <div class="grid grid-cols-2 place-items-start">
                                    <p>ИНН: {org.data.inn}</p>
                                    <p>ОГРН: {org.data.ogrn}</p>
                                </div>
                                <p>{org.data.address.value}</p>
                            </div>
                        </ListgroupItem>
                    {/each}
                </Listgroup>
            {/if}
        </Dropdown>
    </form>
</section>
