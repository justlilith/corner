<script lang='ts' context='module'>
  export async function load({ fetch }) {
      return {
        props: {
        }
      }
    }
</script>

<script lang='ts'>
  import { onMount } from 'svelte'
  import marked from 'marked'
  
  onMount(()=> {
  })
</script>

<h2>Back Cover 📕</h2>
<div>
  <p>Hey, here are some acknowledgments :></p>
  <p>{@html marked(`
### Software

This site is built with a mix of SvelteKit, Hugo, Markdown, and too many npm packages to list; check out and browse the [src on my GitHub](https://github.com/justlilith/grimoire/blob/main/package.json) to find everything.
`)}</p>
</div>

<style lang='scss'>
</style>