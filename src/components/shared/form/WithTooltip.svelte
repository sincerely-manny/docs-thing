<script context="module" lang="ts">
    export type Suggestion = {
        title: string;
        caption?: string;
        data?: Record<string, string>;
    };
</script>

<script lang="ts">
    import { Listgroup, ListgroupItem, Spinner } from 'flowbite-svelte';
    import { blur } from 'svelte/transition';

    let containerDiv: HTMLDivElement;

    export let className: string | undefined = undefined;
    // export let value: string = '';

    export let onSuggestionClick: (s: Suggestion) => void;

    let tooltipOpened = false;
    let isFocused = false;
    $: tooltipOpened = isFocused;

    const handleFocusIn = () => (isFocused = true);
    const handleFocusOut = () => (isFocused = false);

    const handleInputKeyPress = (e: KeyboardEvent) => {
        const { code } = e;
        if (code === 'ArrowDown' || code === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            if (code === 'ArrowDown') {
                (
                    document.getElementsByClassName('dropdown-list-item')[0] as HTMLButtonElement
                )?.focus();
            } else {
                tooltipOpened = false;
            }
        }
        // else {
        //     isFocused = false;
        //     isFocused = true;
        // }
    };

    const handleSuggestionKeyPress = (e: KeyboardEvent) => {
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
            const input = containerDiv.querySelector('input');
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

    export let suggestions: undefined | Suggestion[] = undefined;
</script>

<div
    class={`relative ${className}`}
    {...$$restProps}
    on:focusin={handleFocusIn}
    on:focusout={handleFocusOut}
    on:keydown={handleInputKeyPress}
    tabindex="-1"
    role="searchbox"
    bind:this={containerDiv}
>
    <slot />
    {#if tooltipOpened}
        <div
            role="tooltip"
            transition:blur={{ amount: 20, duration: 300 }}
            class="absolute z-20 -mt-3 w-full"
        >
            {#if !suggestions}
                <Listgroup>
                    <ListgroupItem class="relative flex justify-center"><Spinner /></ListgroupItem>
                </Listgroup>
            {:else if suggestions.length === 0}
                <Listgroup>
                    <ListgroupItem class="relative flex justify-center">No results</ListgroupItem>
                </Listgroup>
            {:else}
                <Listgroup active class="relative flex flex-col">
                    {#each suggestions as s, i}
                        <ListgroupItem
                            on:click={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSuggestionClick(s);
                                tooltipOpened = false;
                            }}
                            on:keydown={handleSuggestionKeyPress}
                            class="dropdown-list-item relative z-10 outline outline-0 ring-0 transition-colors duration-200 dark:focus:bg-gray-600 dark:focus:text-white"
                            tabindex="-1"
                        >
                            <div class="flex flex-col items-start gap-1 font-normal">
                                <h3 class="font-semibold">{s.title}</h3>
                                {#if s.caption}
                                    <div class="grid grid-cols-2 place-items-start">
                                        {s.caption}
                                    </div>
                                {/if}
                            </div>
                        </ListgroupItem>
                    {/each}
                </Listgroup>
            {/if}
        </div>
    {/if}
</div>
