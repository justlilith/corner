<script lang="ts">
	import Work from '$lib/components/Work.svelte';
	export let data;
</script>

<h2>Work Selection 💼</h2>

<p>
	I'm happy to say that I'm multifaceted; I've worked in many industries throughout my career,
	supporting a number of neat projects. Some of those industries include:
</p>
<ul>
	<li>Software engineering</li>
	<li>Web design</li>
	<li>Research and development</li>
	<li>Digital distribution</li>
	<li>Healthcare services</li>
	<li>Apparel design</li>
	<li>Apparel manufacturing</li>
</ul>
<p>If you would like my assistance, please send me an email; I love to collaborate.</p>

<p>Below is a selection of a few projects I've had the privilege to work on and love.</p>

<hr />

{#each data?.props?.workEntries as work}
	<Work {work}></Work>
{/each}

<style lang="scss">
</style>
