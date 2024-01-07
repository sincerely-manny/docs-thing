<script lang="ts">
    import { page } from '$app/stores';
    import throttle from 'lodash.throttle';
    import { FileStack, Home, Users } from 'lucide-svelte';
    import type { ComponentType } from 'svelte';

    const links: [string, string, ComponentType][] = [
        ['/', 'Dashdoard', Home],
        ['/invoice', 'Invoices', FileStack],
        ['/client', 'Clients', Users],
    ];

    let containerRef: HTMLElement;
    let menuItemCollection: HTMLCollectionOf<HTMLElement> | undefined;
    $: menuItemCollection = containerRef?.firstElementChild
        ?.children as HTMLCollectionOf<HTMLElement>;
    let menuItems: {
        element: HTMLElement;
    }[];
    $: menuItems = menuItemCollection
        ? Array.from(menuItemCollection!).map((el) => ({
              element: el,
          }))
        : [];
    const handleMousemove = (e: MouseEvent) => {
        menuItems?.forEach((item, i) => {
            const distanceY = Math.abs(
                e.pageY -
                    (item.element.getBoundingClientRect().top + item.element.offsetHeight / 2),
            );
            const senseDist = 100;
            const scaleDelta = 0.25;
            const scale =
                distanceY > senseDist ? 1 : (scaleDelta / senseDist) * (senseDist - distanceY) + 1;
            item.element.style.transform = `scale(${scale})`;
        });
    };
    const handleMousemoveThrottled = throttle(handleMousemove, 300);
    const handleMouseout = (e: MouseEvent) => {
        menuItems?.forEach((item) => {
            item.element.style.transform = `scale(1)`;
        });
    };
</script>

<section
    class="group relative border-r border-slate-800/80 bg-white/10 text-slate-600"
    bind:this={containerRef}
    on:mousemove={handleMousemove}
    on:mouseleave={handleMouseout}
    role="application"
>
    <nav class="flex flex-col gap-4 overflow-hidden bg-transparent p-4 text-xs">
        {#each links as [link, title, Icon]}
            <a
                href={link}
                class="static flex aspect-square flex-col
                items-center justify-center gap-1 rounded-full bg-white/50 p-3 shadow-lg outline outline-1 transition-all duration-150 hover:text-slate-800
                active:opacity-60 group-hover:transition-[colors,opacity] aria-current:bg-slate-700/50 aria-current:text-primary-500"
                aria-current={'/' + $page.url.pathname.split('/')[1] === link}
            >
                <Icon />
                <span>{title}</span>
            </a>
        {/each}
    </nav>
</section>
