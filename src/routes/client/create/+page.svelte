<script lang="ts">
    import { page } from '$app/stores';
    import type { ResDTO, Suggestion } from '$lib/dadata/types';
    import { clientTypes, clientsInsertSchema } from '$lib/db/schema';
    import TextInput from 'components/shared/form/TextInput.svelte';
    import {
        Button,
        FloatingLabelInput,
        Helper,
        Label,
        Listgroup,
        ListgroupItem,
        Radio,
        Spinner,
    } from 'flowbite-svelte';
    import debounce from 'lodash.debounce';
    import { Save } from 'lucide-svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';

    export let data: PageData;
    const { form, enhance, errors, validate } = superForm(data.form, {
        validators: clientsInsertSchema,
        taintedMessage: null,
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
        const addressContainsIndex = /^[0-9]{6}.*/.test(org.data.address.value);
        $form.address =
            (!addressContainsIndex ? org.data.address.data.postal_code + ', ' : '') +
            org.data.address.value;
        validate('address');
        $form.email = org.data.emails || $form.email;
        validate('email');
        document.getElementById('emailInput')?.focus();
    };

    $: $form.opf = selectedSearchOption === searchOptions[0] ? searchOptions[0] : clientTypes[1];

    const handleKeyPressOnNameInput = (e: KeyboardEvent) => {
        const { code } = e;
        if (code === 'ArrowDown' || code === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            if (code === 'ArrowDown') {
                (
                    document.getElementsByClassName('dropdown-list-item')[0] as HTMLButtonElement
                )?.focus();
            } else {
                namesearchDropdpwnIsOpen = false;
            }
        }
    };
    const handleKeyPressOnListItem = (e: KeyboardEvent) => {
        const { code } = e;
        const currentTarget = e.currentTarget as HTMLButtonElement;
        if (code === 'ArrowDown' || code === 'ArrowUp' || code === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            const [next, prev, firstEl] = [
                currentTarget?.nextElementSibling,
                currentTarget?.previousElementSibling,
                currentTarget?.parentElement?.firstElementChild,
            ] as HTMLElement[];
            // const lastEl = parent?.lastElementChild as HTMLButtonElement;
            const input = document.getElementById('nameInput');
            let focusTo: HTMLElement | undefined;
            switch (code) {
                case 'ArrowDown':
                    focusTo = next || firstEl;
                    break;
                case 'ArrowUp':
                    focusTo = prev || input;
                    break;
                case 'Escape':
                    focusTo = input || undefined;
                    break;
            }
            focusTo?.focus();
        }
    };

    $: {
        console.log($form);
    }
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
            class="relative"
        >
            <FloatingLabelInput
                type="text"
                name="name"
                id="nameInput"
                bind:value={$form.name}
                color={$errors.name ? 'red' : 'base'}
                on:keydown={handleKeyPressOnNameInput}
            >
                Name
            </FloatingLabelInput>
            <Helper color="red">{$errors.name || ''}&nbsp;</Helper>
            <div />
            <div
                role="tooltip"
                class={`absolute w-full ${namesearchDropdpwnIsOpen ? '' : 'hidden'}`}
            >
                {#if !suggestedOrgs}
                    <Listgroup>
                        <ListgroupItem class="flex justify-center"><Spinner /></ListgroupItem>
                    </Listgroup>
                {:else if suggestedOrgs.suggestions.length === 0}
                    <Listgroup>
                        <ListgroupItem class="flex justify-center">No results</ListgroupItem>
                    </Listgroup>
                {:else}
                    <Listgroup active class="relative z-10 flex flex-col">
                        {#each suggestedOrgs.suggestions as org, i}
                            <ListgroupItem
                                on:click={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSuggestionClick(org);
                                }}
                                on:keydown={handleKeyPressOnListItem}
                                class="dropdown-list-item relative z-10 outline outline-0 ring-0 transition-colors duration-200 dark:focus:bg-gray-600 dark:focus:text-white"
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
            </div>
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
                <TextInput {errors} name="inn" label="INN" bind:value={$form.inn} />
                <TextInput {errors} name="ogrn" label="OGRN" bind:value={$form.ogrn} />
            </div>
        {/if}
        <input type="hidden" name="opf" bind:value={$form.opf} />
        <TextInput {errors} name="address" label="Address" bind:value={$form.address} />
        <TextInput
            {form}
            {errors}
            name="email"
            label="Email"
            id="emailInput"
            bind:value={$form.email}
        />
        <Button type="submit" class="flex gap-2">
            <Save />
            Save
        </Button>
        <Helper color="red">{$errors._errors || ''}&nbsp;</Helper>
    </form>
</section>
