<script lang="ts" generics="Value extends Record<string, string>">
    // TODO: abstract fields (title & price)
    import TextInput from 'components/shared/form/TextInput.svelte';
    import WithTooltip from 'components/shared/form/WithTooltip.svelte';
    import { ArrowDown, ArrowUp } from 'lucide-svelte';
    import { nanoid } from 'nanoid';
    import { cubicInOut } from 'svelte/easing';
    import { writable } from 'svelte/store';
    import { type TransitionConfig, blur } from 'svelte/transition';
    import type { ZodValidation } from 'sveltekit-superforms';
    import type { SuperForm } from 'sveltekit-superforms/client';
    import { z } from 'zod';

    export let errors: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['errors'];
    export let name: string;

    export let value: Value[];

    const emptyValue = Object.fromEntries(Object.keys(value[0]).map((k) => [k, ''])) as Value;

    const inputs = writable<(Value & { key: string })[]>(
        value.map((v) => ({ ...v, key: nanoid() })),
    );
    inputs.subscribe((inputs) => {
        if (inputs[inputs.length - 1].title.length > 0) {
            $inputs.push({ ...emptyValue, key: nanoid() });
        }
        if (
            inputs[inputs.length - 2] &&
            inputs[inputs.length - 2].title.length === 0 &&
            inputs[inputs.length - 1].title.length === 0
        ) {
            $inputs.pop();
        }
    });

    const deleteEmptyServices = () => {
        for (let i = 0; i < $inputs.length; i++) {
            const { title } = $inputs[i];
            if (i < $inputs.length - 1 && title.length === 0) {
                $inputs.splice(i, 1);
                $inputs = $inputs;
                i--;
            }
        }
    };

    let servicesFocus = false;
    const handleServicesFocusIn = () => {
        servicesFocus = true;
    };
    const handleServicesFocusOut = () => {
        servicesFocus = false;
    };
    $: {
        setTimeout(() => {
            if (!servicesFocus) {
                deleteEmptyServices();
            }
        }, 500);
    }

    const slideItFromTop = (
        node: HTMLElement,
        { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {},
    ): TransitionConfig => {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
            opacity: ${target_opacity - od * u};
            filter: ${f} blur(${u * amount}px);
            margin-top: -${u * node.clientHeight}px;
        `,
        };
    };

    const handleInput = () => {
        value =
            ($inputs
                .map((v) => {
                    const { key, ...rest } = v;
                    if (rest.title.length) {
                        return rest as unknown as Value;
                    }
                })
                .filter((v) => v !== undefined) as Value[]) || emptyValue;
    };

    const swap = (a: number, b: number) => {
        $inputs[a].key = nanoid();
        $inputs[b].key = nanoid();
        [$inputs[a], $inputs[b]] = [$inputs[b], $inputs[a]];
    };
</script>

<div
    tabindex="-1"
    on:focusin={handleServicesFocusIn}
    on:focusout={handleServicesFocusOut}
    on:input={handleInput}
>
    <p class="mb-2"><slot /></p>
    {#each $inputs as { title, price, key }, i (key)}
        <div
            class="flex items-center justify-stretch gap-4"
            transition:slideItFromTop={{ duration: 300, amount: 20 }}
        >
            <div class="-ml-4 flex w-4 flex-col justify-between self-stretch py-3">
                {#if $inputs[i - 1] && i !== $inputs.length - 1}
                    <button
                        transition:blur={{ duration: 300, amount: 20 }}
                        class="opacity-70 transition-all hover:opacity-100"
                        type="button"
                        on:click|preventDefault={() => {
                            swap(i, i - 1);
                        }}
                    >
                        <ArrowUp size={14} />
                    </button>
                {:else}
                    <div />
                {/if}
                {#if $inputs[i + 1] && !($inputs[i + 1].title.length === 0 && i === $inputs.length - 2)}
                    <button
                        transition:blur={{ duration: 300, amount: 20 }}
                        class="opacity-70 transition-all hover:opacity-100"
                        type="button"
                        on:click|preventDefault={() => {
                            swap(i, i + 1);
                        }}
                    >
                        <ArrowDown size={14} />
                    </button>
                {:else}
                    <div />
                {/if}
            </div>
            <span>
                #{i + 1}
            </span>
            <WithTooltip
                value="11"
                className="grow"
                getSuggestions={() => [{ title: 'dasda', caption: '3211' }]}
                onSuggestionClick={(e) => {}}
            >
                <TextInput
                    {errors}
                    name={`${name}-title-${i}`}
                    label="Title"
                    bind:value={$inputs[i].title}
                />
            </WithTooltip>
            <TextInput
                {errors}
                name={`${name}-price-${i}`}
                label="Price"
                bind:value={$inputs[i].price}
            />
            <span>₽</span>
        </div>
    {/each}
</div>
