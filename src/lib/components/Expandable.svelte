<script lang="ts">
	import { slide } from 'svelte/transition';

	let visible = false;
</script>

<div class="expandable">
	<div class="expandable-label">
		<button
			on:click={() => {
				visible = !visible;
			}}
			class="expandable-button"><slot name="label" /></button
		>
	</div>
	{#if visible}
		<section class="expandable-content" transition:slide|global>
			<slot name="content" />
		</section>
	{/if}
</div>

<style lang="scss">
	.expandable {
		margin: 0;
    margin-bottom: 1em;
    margin-top: 1em;
	}
	.expandable-label {
		background: black;
		color: hsl(0, 0%, 70%);
		border-left: medium solid cyan;
		padding-left: 12px;
		border-bottom: thin solid hsl(0, 0%, 15%);
	}
	.expandable-button {
		background: none;
		border: none;
		color: hsl(0, 0%, 70%);
		cursor: pointer;
		font-size: 0.9em;
		margin: none;
		padding: none;
    width: 100%;
	}
	.expandable-content {
		background: hsl(0, 0%, 20%);
		color: white;
		padding: 12px;
		// padding-left:12px;
	}
</style>
