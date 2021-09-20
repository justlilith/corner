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

<h2>Notes</h2>
<div>
  
{@html marked(`
Here are some things I wish I knew before I started... well, anything! ^_^ These range from tribal knowledge around programming paradigms to behavioral management (with regards to ADHD). Plus, whatever else comes to mind.

These are in no particular order. Eventually, they will be tagged and categorized. Everything is a work in progress. Oh! That reminds me!

- **Everything is a work in progress.** It's okay if something isn't done; few things truly are. Be kind to yourself.

- **Perfection isn't real.** Get as close as you want. Don't do so to your detriment.

- **C# is discount Java.** Kidding. They're pretty similar, though.

- **There's really no perfect paradigm — just the right tool at the right moment.**
- - **There can be more than one 'right tool.'**

- **Functional programming is just pipelining things and ETL on a small scale.**

`)}

  </div>
  
  <style lang='scss'>
  </style>