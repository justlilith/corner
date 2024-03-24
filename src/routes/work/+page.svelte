<script lang='ts'>
  import Work from "$lib/components/Work.svelte";
  export let data;
</script>

<h2>Current and Past Work 💼</h2>
{#each data?.props?.workEntries as work}
<Work {work}></Work>
{/each}

<style lang='scss'>
</style>