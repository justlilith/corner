<script lang='ts'>
  import Work from "$lib/components/Work.svelte";
  export let data;
</script>

<h2>Current and Past Work 💼</h2>

<p>Here are a few projects I've worked on.</p>

<p>If you would like my assistance, please send me an email; I love to collaborate.</p>

<hr />

{#each data?.props?.workEntries as work}
<Work {work}></Work>
{/each}

<style lang='scss'>
</style>