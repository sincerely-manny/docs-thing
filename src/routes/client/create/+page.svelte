<script lang="ts">
    import { clientTypes, clientsInsertSchema } from '$lib/db/schema';
    import { page } from '$app/stores';
    import {
        Button,
        Dropdown,
        FloatingLabelInput,
        Helper,
        Label,
        Listgroup,
        ListgroupItem,
        Radio,
        Spinner,
    } from 'flowbite-svelte';
    import type { ResDTO, Suggestion } from 'lib/dadata/types';
    import debounce from 'lodash.debounce';
    import { Save } from 'lucide-svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';
    import type { SubmitFunction } from '@sveltejs/kit';
    import type { SvelteComponent } from 'svelte';

    export let data: PageData;
    const { form, enhance, errors, validate } = superForm(data.form, {
        validators: clientsInsertSchema,
    });
    const searchOptions = ['ФЛ', 'ЮЛ/ИП'] as const;
    let selectedSearchOption: (typeof searchOptions)[number] = searchOptions[1];
    let nameFieldIsFocused = false;
    let namesearchDropdpwnIsOpen = false;
    $: namesearchDropdpwnIsOpen =
        nameFieldIsFocused &&
        selectedSearchOption === searchOptions[1] &&
        $form.name !== undefined &&
        $form.name.length >= 2;

    let suggestedOrgs: ResDTO | null = null;
    const setSuggestedOrgs = debounce(async () => {
        suggestedOrgs = await (await fetch(`/api/search-organisation?query=${$form.name}`)).json();
    }, 500);
    $: $form.name &&
        $form.name.length >= 2 &&
        (() => {
            suggestedOrgs = null;
            setSuggestedOrgs();
        })();

    const handleSuggestionClick = (org: Suggestion) => {
        $form.name = org.data.name.full;
        validate('name');
        $form.opf = org.data.opf.short;
        validate('opf');
        $form.inn = org.data.inn;
        validate('inn');
        $form.ogrn = org.data.ogrn;
        validate('ogrn');
        $form.address = org.data.address.data.postal_code + ', ' + org.data.address.value;
        validate('address');
        $form.email = org.data.emails || $form.email;
        validate('email');
        document.getElementById('email')?.focus();
    };

    $: $form.opf = selectedSearchOption === searchOptions[0] ? searchOptions[0] : clientTypes[1];

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            (
                document.getElementsByClassName('dropdown-list-item')[0] as HTMLButtonElement
            )?.focus();
        }
    };
</script>

<section class="flex justify-center">
    <form
        method="post"
        class="flex w-[512px] flex-col gap-5"
        use:enhance
        action={`?ref=${$page.url.searchParams.get('ref')}`}
    >
        <div>
            {#each searchOptions as option}
                <Radio bind:group={selectedSearchOption} inline value={option} class="mr-2">
                    {option}
                </Radio>
            {/each}
        </div>
        <div
            tabindex="-1"
            on:focusin={() => (nameFieldIsFocused = true)}
            on:focusout={() => (nameFieldIsFocused = false)}
        >
            <FloatingLabelInput
                type="text"
                name="name"
                bind:value={$form.name}
                color={$errors.name ? 'red' : 'base'}
                on:keydown={handleKeyPress}
            >
                Name
            </FloatingLabelInput>
            <Helper color="red">{$errors.name || ''}&nbsp;</Helper>
            <div />
            <Dropdown bind:open={namesearchDropdpwnIsOpen} class="max-w-lg">
                {#if !suggestedOrgs}
                    <Listgroup>
                        <ListgroupItem><Spinner /></ListgroupItem>
                    </Listgroup>
                {:else if suggestedOrgs.suggestions.length === 0}
                    <Listgroup>
                        <ListgroupItem>No results</ListgroupItem>
                    </Listgroup>
                {:else}
                    <Listgroup active>
                        {#each suggestedOrgs.suggestions as org, i}
                            <ListgroupItem
                                on:click={() => handleSuggestionClick(org)}
                                class="dropdown-list-item outline outline-1 outline-red-500 focus:outline-green-500"
                                tabindex="-1"
                            >
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
        </div>
        {#if selectedSearchOption !== searchOptions[0]}
            <div>
                <Label class="grid grid-cols-[4em_1fr] items-center">
                    <div>OPF:</div>
                    <div>
                        {#each clientTypes as type}
                            {#if type !== 'ФЛ'}
                                <Radio bind:group={$form.opf} inline value={type} class="mr-2">
                                    {type}
                                </Radio>
                            {/if}
                        {/each}
                    </div>
                </Label>
                <Helper color="red">{$errors.opf || ''}&nbsp;</Helper>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <FloatingLabelInput
                        type="text"
                        name="inn"
                        bind:value={$form.inn}
                        color={$errors.inn ? 'red' : 'base'}
                    >
                        INN
                    </FloatingLabelInput>
                    <Helper color="red">{$errors.inn || ''}&nbsp;</Helper>
                </div>
                <div>
                    <FloatingLabelInput
                        type="text"
                        name="ogrn"
                        bind:value={$form.ogrn}
                        color={$errors.ogrn ? 'red' : 'base'}
                    >
                        OGRN
                    </FloatingLabelInput>
                    <Helper color="red">{$errors.ogrn || ''}&nbsp;</Helper>
                </div>
            </div>
        {/if}
        <input type="hidden" name="opf" bind:value={$form.opf} />
        <FloatingLabelInput
            type="text"
            name="address"
            bind:value={$form.address}
            color={$errors.address ? 'red' : 'base'}
        >
            Address
        </FloatingLabelInput>
        <Helper color="red">{$errors.address || ''}&nbsp;</Helper>
        <FloatingLabelInput
            type="email"
            name="email"
            id="email"
            bind:value={$form.email}
            color={$errors.email ? 'red' : 'base'}
        >
            Email
        </FloatingLabelInput>
        <Helper color="red">{$errors.email || ''}&nbsp;</Helper>
        <Button type="submit" class="flex gap-2">
            <Save />
            Save
        </Button>
        <Helper color="red">{$errors._errors || ''}&nbsp;</Helper>
    </form>
</section>
