<script lang="ts">
    import theme from '$lib/tailwindconfig';
    import { DatePicker } from 'date-picker-svelte';
    import { FloatingLabelInput, Helper } from 'flowbite-svelte';
    import { blur } from 'svelte/transition';
    import type { ZodValidation } from 'sveltekit-superforms';
    import { type SuperForm } from 'sveltekit-superforms/client';
    import { z } from 'zod';

    export let errors: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['errors'];
    export let name: string;
    export let label: string;
    export let value: Date = new Date();

    const stringToDate = (string: string) => {
        const re = /^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/;
        if (!re.test(string.trim())) {
            throw new Error('Invalid date format');
        }
        const [day, month, year] = string.split('.');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date;
    };

    const dateToString = (date: Date) => date.toLocaleDateString('ru-RU');

    let datepickerOpen = false;
    let isFocused = false;

    const handleFocusIn = () => {
        isFocused = true;
    };
    const handleFocusOut = () => {
        isFocused = false;
    };

    $: datepickerOpen = isFocused;

    $: string = dateToString(value);

    const handleInput = (event: Event) => {
        $errors[name.toString()] = [];
        const input = event.currentTarget as HTMLInputElement;
        if (!input) {
            throw new Error('Error handling input');
        }
        try {
            value = stringToDate(input.value);
        } catch (err) {
            $errors[name.toString()] = [(err as Error).toString()];
        }
    };
</script>

<div {...$$restProps} on:focusin={handleFocusIn} on:focusout={handleFocusOut} tabindex="-1">
    <FloatingLabelInput
        type="text"
        name={`readable-${name.toString()}`}
        color={$errors[name.toString()] ? 'red' : 'base'}
        value={string}
        on:input={handleInput}
    >
        {label}
    </FloatingLabelInput>
    <Helper color="red">{$errors[name.toString()] || ''}&nbsp;</Helper>
    {#if datepickerOpen}
        <div
            class="datepicker relative shadow-lg"
            transition:blur={{ amount: 20, duration: 300 }}
            style={`
                --date-picker-foreground: ${theme.colors.white};
                --date-picker-background: ${theme.colors.gray[700]};
                --date-picker-highlight-border: ${theme.colors.primary[500]};
                --date-picker-selected-color: ${theme.colors.primary[500]};
                --date-picker-selected-background: ${theme.colors.gray[800]};
            `}
        >
            <div class="absolute">
                <DatePicker bind:value />
            </div>
        </div>
    {/if}
</div>
