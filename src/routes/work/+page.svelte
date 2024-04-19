<script lang='ts'>
  import Work from "$lib/components/Work.svelte";
  export let data;
</script>

<h2>Work Selection 💼</h2>

<p>I've worked on many projects through my career, within these industries: apparel, manufacturing, research and development, web design, and software. Here's a small selection of a few projects I love.</p>

<p>If you would like my assistance, please send me an email; I love to collaborate.</p>

<hr />

{#each data?.props?.workEntries as work}
<Work {work}></Work>
{/each}

<style lang='scss'>
</style>