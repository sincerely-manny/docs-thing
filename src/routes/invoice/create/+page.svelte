<script lang="ts">
    import Datepicker from 'components/shared/form/Datepicker.svelte';
    import TextInputsArray from 'components/shared/form/TextInputsArray.svelte';
    import { Button, FloatingLabelInput, Helper, Radio } from 'flowbite-svelte';
    import { ChevronDownCircle, Save, UserPlus } from 'lucide-svelte';
    import { blur } from 'svelte/transition';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';
    import debounce from 'lodash.debounce';
    import type { Suggestion } from 'components/shared/form/WithTooltip.svelte';
    import type { InferSelectModel } from 'drizzle-orm';
    import type { servicesLib } from '$lib/db/schema';

    export let data: PageData;

    const { form, errors, enhance } = superForm(data.form, {
        resetForm: false,
        dataType: 'json',
    });

    let selectClientOpen = !$form.clientId;

    let date: Date = new Date($form.date);

    $: {
        $form.date = date.toISOString();
    }

    if ($errors.services && $errors.services[0] && $errors.services[0].title) {
        $errors.services[0].title = undefined;
    } // fix unwanted pre-validation

    const getSuggestions = async (q: string) => {
        if (q.length === 0) {
            return [];
        }
        const res = (await (await fetch(`/api/services?query=${q}`)).json()) as
            | InferSelectModel<typeof servicesLib>[]
            | undefined;
        if (res) {
            return res;
        }
        return [];
    };

    type ServicesSuggestionQuery =
        | {
              query?: string;
              status?: 'loading' | 'success' | 'error';
              suggestions?: Promise<Suggestion[] | void>;
          }
        | undefined;

    let servicesSuggestionQueries: ServicesSuggestionQuery[] = [];

    let servicesSuggestions: (Suggestion[] | undefined)[] = [];
    $: servicesSuggestions.length = $form.services.length;

    const updateQueries = (list: typeof $form.services) => {
        list.forEach(({ title }, i) => {
            if (title !== servicesSuggestionQueries[i]?.query) {
                servicesSuggestions[i] = undefined;
                servicesSuggestionQueries[i] = {
                    query: title,
                    status: 'loading',
                    suggestions: getSuggestions(title)
                        ?.then((res) => {
                            servicesSuggestions[i] = res;
                            servicesSuggestionQueries[i]!.status = 'success';
                        })
                        .catch((err) => {
                            servicesSuggestionQueries[i]!.status = 'error';
                        }),
                };
            }
        });
    };

    const updateQueriesDebounced = debounce(updateQueries, 500);

    $: {
        updateQueriesDebounced($form.services);
    }
</script>

<section class="flex justify-center">
    <form
        method="post"
        class="flex w-[512px] flex-col gap-5 transition-all delay-500 duration-500"
        use:enhance
    >
        <div class="relative z-20">
            <Button
                class="flex w-full items-end justify-between"
                on:click={() => {
                    selectClientOpen = !selectClientOpen;
                }}
            >
                <div class="flex min-h-6 items-center justify-start">
                    {data.clients.find((client) => client.id === $form.clientId)?.name ||
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
                            bind:group={$form.clientId}
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
            <Datepicker {errors} name="date" label="Date" bind:value={date} />
        </div>
        <TextInputsArray
            {errors}
            name="services"
            bind:value={$form.services}
            bind:suggestions={servicesSuggestions}
        >
            Services:</TextInputsArray
        >
        <Button type="submit" class="flex gap-2">
            <Save />
            Submit
        </Button>
    </form>
</section>
