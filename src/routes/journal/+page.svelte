<script lang="ts">
	import JournalEntry from '$lib/components/JournalEntry.svelte';
	import { onMount } from 'svelte';
	export let data;
	let contentList: JournalEntryT[] = data?.props?.contentList;

	let sortedList = [];

	onMount(() => {
		sortedList = [...contentList]?.sort((x, y) => y.index - x.index);
	});
</script>

<h2>Journal 📜</h2>

<p>Here are a few thoughts, in somewhat long form.</p>

<hr />

<article>
	{#each sortedList as content}
		<JournalEntry {content}></JournalEntry>
	{/each}
</article>

<style lang="scss">
</style>
