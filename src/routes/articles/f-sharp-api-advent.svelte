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
So, you wanna learn F Sharp? And you wanna do so by building a key-value store, served via a .NET 6.0 minimal API? Then this is the perfect post for you ^_^

Let us begin.

`)}

</div>

<style lang='scss'>
</style>