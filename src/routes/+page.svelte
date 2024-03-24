<script lang="ts">
	import JournalEntry from '$lib/components/JournalEntry.svelte';
	export let data;

	let contentList: JournalEntryT[] = data?.props?.contentList;
</script>

<p>My name is Lilith. Welcome to one of my grimoires.</p>
<p>This one mostly concerns software engineering and computer science.</p>
<p>Thank you for visiting.</p>
<hr />

<h3>journal.slice(0,3):</h3>
<!-- <nav id='sidebar'>
  <ul>
    {#each entries as entry}
    <li><a href={`#${entry}`}>{entry}</a></li>
    {/each}
  </ul>
</nav> -->
<article>
	{#if contentList}
		{#each [...contentList]?.sort((x, y) => y.index - x.index).slice(0,3) as content}
			<JournalEntry {content}></JournalEntry>
		{/each}
	{/if}
</article>

<style lang="scss">
</style>
