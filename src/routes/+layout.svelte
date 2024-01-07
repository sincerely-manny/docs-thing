<script>
    import Sidebar from 'components/Sidebar.svelte';
    import '../app.css';
</script>

<div class="bg-gradient-to-tr from-slate-800 via-primary-800 to-cyan-800">
    <main
        class="dark container mx-auto flex min-h-screen justify-stretch justify-items-stretch gap-10 p-10 text-gray-300"
    >
        <div
            class="flex grow justify-stretch justify-items-stretch gap-0 overflow-clip rounded-lg bg-slate-700/80 shadow-2xl backdrop-blur-xl"
        >
            <Sidebar />
            <section class="grow p-10">
                <slot />
            </section>
        </div>
    </main>
</div>
