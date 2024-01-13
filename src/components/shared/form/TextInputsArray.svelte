<script lang="ts" generics="Value extends Record<string, string>">
    // TODO: abstract fields (title, amount, price)
    import WithTooltip, { type Suggestion } from 'components/shared/form/WithTooltip.svelte';
    import { Helper, FloatingLabelInput } from 'flowbite-svelte';
    import { ArrowDown, ArrowUp } from 'lucide-svelte';
    import { nanoid } from 'nanoid';
    import { cubicInOut } from 'svelte/easing';
    import { writable } from 'svelte/store';
    import { blur, type TransitionConfig } from 'svelte/transition';
    import type { ZodValidation } from 'sveltekit-superforms';
    import type { SuperForm } from 'sveltekit-superforms/client';
    import { z } from 'zod';

    export let errors: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['errors'];
    export let name: string;
    export let value: Value[];
    export let suggestions: (Suggestion[] | undefined)[];

    const emptyValue = { ...value[0] };

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

    const deleteEmpty = () => {
        for (let i = 0; i < $inputs.length; i++) {
            const { title } = $inputs[i];
            if (i < $inputs.length - 1 && title.length === 0) {
                $inputs.splice(i, 1);
                $inputs = $inputs;
                i--;
            }
        }
    };

    let isFocused = false;
    const handleFocusIn = () => {
        isFocused = true;
    };
    const handleFocusOut = () => {
        isFocused = false;
    };
    $: {
        setTimeout(() => {
            if (!isFocused) {
                deleteEmpty();
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

    const inputErrs = (i: number, inputName: string) =>
        $errors[name.toString()] &&
        /* @ts-ignore */
        $errors[name.toString()][i] &&
        /* @ts-ignore */
        $errors[name.toString()][i][inputName]
            ? /* @ts-ignore */
              $errors[name.toString()][i][inputName]
            : false;

    const handleTooltipClick = (i: number) => (suggestion: Suggestion) => {
        ($inputs[i] as Value & { key: string; title: string }).title = suggestion.title;
        if (suggestion.data?.price) {
            ($inputs[i] as Value & { key: string; price: string }).price = suggestion.data.price;
        }
        handleInput();
    };
</script>

<div tabindex="-1" on:focusin={handleFocusIn} on:focusout={handleFocusOut} on:input={handleInput}>
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
                bind:suggestions={suggestions[i]}
                className="grow"
                onSuggestionClick={handleTooltipClick(i)}
            >
                <div>
                    <FloatingLabelInput
                        type="text"
                        name={`${name}-title-${i}`}
                        bind:value={$inputs[i].title}
                        color={inputErrs(i, 'title') ? 'red' : 'base'}
                    >
                        Title
                    </FloatingLabelInput>
                    <Helper color="red">{inputErrs(i, 'title') || ''}&nbsp;</Helper>
                </div>
            </WithTooltip>
            <div class="w-12">
                <FloatingLabelInput
                    type="text"
                    name={`${name}-amount-${i}`}
                    bind:value={$inputs[i].amount}
                    color={inputErrs(i, 'amount') ? 'red' : 'base'}
                >
                    Amount
                </FloatingLabelInput>
                <Helper color="red">{inputErrs(i, 'amount') || ''}&nbsp;</Helper>
            </div>
            <div class="w-20">
                <FloatingLabelInput
                    type="text"
                    name={`${name}-price-${i}`}
                    bind:value={$inputs[i].price}
                    color={inputErrs(i, 'price') ? 'red' : 'base'}
                >
                    Price
                </FloatingLabelInput>
                <Helper color="red">{inputErrs(i, 'price') || ''}&nbsp;</Helper>
            </div>
            <span>₽</span>
        </div>
    {/each}
</div>
