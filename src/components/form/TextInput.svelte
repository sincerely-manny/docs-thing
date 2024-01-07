<script lang="ts">
    import { FloatingLabelInput, Helper } from 'flowbite-svelte';
    import type { ZodValidation } from 'sveltekit-superforms';
    import type { SuperForm } from 'sveltekit-superforms/client';
    import type { z } from 'zod';

    export let form: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['form'];
    export let errors: SuperForm<ZodValidation<z.AnyZodObject>, unknown>['errors'];
    export let name: keyof typeof $form;
    export let label: string;
    export let className: string | undefined = undefined;
</script>

<div class={className}>
    <FloatingLabelInput
        type="text"
        {name}
        bind:value={$form[name.toString()]}
        color={$errors[name.toString()] ? 'red' : 'base'}
        {...$$restProps}
    >
        {label}
    </FloatingLabelInput>
    <Helper color="red">{$errors[name.toString()] || ''}&nbsp;</Helper>
</div>
