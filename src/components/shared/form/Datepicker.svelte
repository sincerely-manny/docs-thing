<script lang="ts">
    import { DatePicker } from 'date-picker-svelte';
    import { FloatingLabelInput, Helper } from 'flowbite-svelte';
    import { derived } from 'svelte/store';
    import { blur } from 'svelte/transition';
    import type { ZodValidation } from 'sveltekit-superforms';
    import { type SuperForm } from 'sveltekit-superforms/client';
    import { z } from 'zod';
    import tailwindConfig from '../../../../tailwind.config';
    import resolveConfig from 'tailwindcss/resolveConfig';

    export let form: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['form'];
    export let errors: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['errors'];
    export let name: keyof typeof $form;
    export let label: string;

    const readable = derived(form, ($form) => $form[name.toString()].toLocaleDateString('ru-RU'));
    $: inputValue = $readable;

    const handleInput = () => {
        $errors[name.toString()] = [];
        try {
            const re = /^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/;
            if (!re.test(inputValue.trim())) {
                throw new Error('Invalid date format');
            }
            const [day, month, year] = inputValue.split('.');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            $form[name.toString()] = date;
        } catch (e) {
            $errors[name.toString()] = [(e as Error).toString()];
        }
    };

    let datepickerOpen = false;
    let isFocused = false;

    const handleFocusIn = () => {
        isFocused = true;
    };
    const handleFocusOut = () => {
        isFocused = false;
    };

    $: datepickerOpen = isFocused;

    const { theme } = resolveConfig(tailwindConfig);
</script>

<div {...$$restProps} on:focusin={handleFocusIn} on:focusout={handleFocusOut} tabindex="-1">
    <FloatingLabelInput
        type="text"
        name={`readable-${name.toString()}`}
        color={$errors[name.toString()] ? 'red' : 'base'}
        bind:value={inputValue}
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
                <DatePicker bind:value={$form[name.toString()]} />
            </div>
        </div>
    {/if}
</div>
