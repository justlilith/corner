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

<h2>Spells ✨</h2>
<div>

{@html marked(`
Here are some boilerplate things I use to bootstrap new projects at the moment. Spells, if you will.

- Check back later!

`)}

</div>

<style lang='scss'>
</style>