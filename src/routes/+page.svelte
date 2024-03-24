<script lang="ts" context="module">
	export async function load({ fetch }) {
		let contentList = [];
		const entriesResponse: Response = await fetch('/api/journal/entries.json');
		const entriesBodyJson = await entriesResponse.json();
		if (entriesResponse.ok) {
			contentList = entriesBodyJson.dirList.map(async (entry) => {
				let res: Response = await fetch(`/api/journal/${entry}`);
				return await res.json();
			});

			return {
				props: {
					entryList: entriesBodyJson.dirList,
					contentList: (await Promise.all(contentList)).map((x) => x.article)
				}
			};
		}
	}
</script>

<script lang="ts">
	import JournalEntry from '$lib/components/JournalEntry.svelte';
	export let contentList: JournalEntryT[];

</script>

<svelte:head></svelte:head>

<h2>Journal 📜</h2>
<!-- <nav id='sidebar'>
  <ul>
    {#each entries as entry}
    <li><a href={`#${entry}`}>{entry}</a></li>
    {/each}
  </ul>
</nav> -->
<article>
	{#if contentList}
		{#each contentList?.sort((x, y) => y.index - x.index) as content}
			<JournalEntry {content}></JournalEntry>
		{/each}
	{/if}
</article>

<style lang="scss">
</style>
