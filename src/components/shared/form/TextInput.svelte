<script lang="ts">
    import { FloatingLabelInput, Helper } from 'flowbite-svelte';
    import type { ZodValidation } from 'sveltekit-superforms';
    import type { SuperForm } from 'sveltekit-superforms/client';
    import type { z } from 'zod';

    let form: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['form'];
    export let errors: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['errors'];
    export let name: keyof typeof $form;
    export let label: string;
    export let className: string | undefined = undefined;
    export let value: string | undefined = '';
</script>

<div class={className}>
    <FloatingLabelInput
        type="text"
        {name}
        bind:value
        color={$errors[name.toString()] ? 'red' : 'base'}
        {...$$restProps}
        on:input
        on:change
    >
        {label}
    </FloatingLabelInput>
    <Helper color="red">{$errors[name.toString()] || ''}&nbsp;</Helper>
</div>
