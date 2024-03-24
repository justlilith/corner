<script lang="ts">
	import JournalEntry from '$lib/components/JournalEntry.svelte';
	import { onMount } from 'svelte';
	export let data;
	let contentList: JournalEntryT[] = data?.props?.contentList;

	let sortedList = [];

	onMount(()=> {
		sortedList = [...contentList]?.sort((x, y) => y.index - x.index)
		console.log(sortedList)
	})
</script>

<h2>Journal 📜</h2>
<!-- <nav id='sidebar'>
  <ul>
    {#each entries as entry}
    <li><a href={`#${entry}`}>{entry}</a></li>
    {/each}
  </ul>
</nav> -->
<article>
		{#each sortedList as content}
			<JournalEntry {content}></JournalEntry>
		{/each}
</article>

<style lang="scss">
</style>
