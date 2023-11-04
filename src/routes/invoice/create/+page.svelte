<script lang="ts">
    import { A, Button, Dropdown, Input, Label, Radio } from 'flowbite-svelte';
    import { ChevronRightCircle, Save, UserPlus } from 'lucide-svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';

    export let data: PageData;

    const { form } = superForm(data.form);
    let selectedClient: (typeof data.clients)[number]['id'] | undefined = undefined;
    let selectClientOpen = true;
</script>

<section>
    <form method="POST" class="flex max-w-lg flex-col gap-5">
        <div>
            <Button class="flex w-1/2 justify-between">
                {data.clients.find((client) => client.id === selectedClient)?.name ||
                    'Select a client'}
                <ChevronRightCircle />
            </Button>
            <Dropdown
                class="flex flex-col gap-2 p-4"
                placement="right-start"
                containerClass="bg-slate-500"
                bind:open={selectClientOpen}
            >
                {#each data.clients as client}
                    <li>
                        <Radio
                            name="clientsGroup"
                            bind:group={selectedClient}
                            value={client.id}
                            on:change={() => (selectClientOpen = false)}
                            class="cursor-pointer text-white"
                        >
                            {client.name}, {client.type}
                        </Radio>
                    </li>
                {/each}
                <a href="/client/create?ref=/invoice/create">
                    <Button color="alternative" size="xs" class="flex gap-1">
                        <UserPlus size="16" />
                        Create new
                    </Button>
                </a>
            </Dropdown>
        </div>
        <Label class="flex place-items-center">
            <span class="w-24 text-white"> Invoice # </span>
            <Input type="text" name="number" bind:value={$form.number} />
        </Label>
        <Button type="submit" class="flex gap-2">
            <Save />
            Submit
        </Button>
    </form>
</section>
