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
  import { marked } from 'marked'
  
  onMount(()=> {
  })
</script>

<h2>Articles</h2>
<div>
  
  {@html marked(`Sometimes I write articles. Here is the current list:`)}
  
  {@html marked(`- [Fedis](/articles/fsharp-advent-api)`)}
  
  </div>
  
  <style lang='scss'>
  </style>