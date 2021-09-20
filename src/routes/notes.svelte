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

These are not maxims; they're things I remind myself of. I'm presenting them here in case they help other people as much as they help me. You may not agree, and that's totally valid! I am not an Oracle. Or Lucent. Nor do I have 9 plans. I'm just me.

Also, these are in no particular order. Eventually, they will be tagged and categorized. Everything is a work in progress. Oh! That reminds me!

- **Everything is a work in progress.** It's okay if something isn't done; few things truly are. Be kind to yourself.

- **Perfection isn't real.** Get as close as you want. Don't do so to your detriment.

- **C# is discount Java.** Kidding. They're pretty similar, though.

- **There's really no perfect paradigm — just the right tool at the right moment.**
- - **There can be more than one 'right tool.'**

- **Functional programming is just pipelining things and ETL on a small scale.**

- **You do not need to be a wizard to code. Just persistent.** Maybe a little stubborn. Masochistic, even.

- **Object-oriented programming is really about passing messages around.**

- **A factory pattern is a real thing.**

- **You know those square brace things in C#? Those are attributes.** And they're kinda neat. Don't think about it too much.

- **Impostor syndrome does not go away; it just gets easier to deal with.** In 5 years, hopefully I feel differently (I haven't in 20, though).

- **It can wait.** Take some notes, save your place, and go do the other thing. But be mindful of the cost of task-switching.

`)}

  </div>
  
  <style lang='scss'>
  </style>