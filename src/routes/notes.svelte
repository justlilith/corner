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

<h2>Notes 📝</h2>
<div id='notes'>
  
{@html marked(`
Here are some things I wish I knew before I started... well, anything! ^_^ These range from tribal knowledge around programming paradigms to behavioral management (with regards to ADHD). Plus, whatever else comes to mind.

These are not maxims; they're things I remind myself of. I'm presenting them here in case they help other people as much as they help me. You may not agree, and that's totally valid! I am not an Oracle. Or Lucent. Nor do I have 9 plans. I'm just me.

Also, these are in no particular order. Eventually, they will be tagged and categorized. Everything is a work in progress. Oh! That reminds me!

### Let's go! 🚀🚀

- **Clarity matters more than cleverness.**
  - [Code golf](https://en.wikipedia.org/wiki/Code_golf) in prod is an [anti-pattern](https://www.bmc.com/blogs/anti-patterns-vs-patterns/).
  - Speed of code matters more than compactness of code.
  - Expeditiously written, yet elegant code is a good goal.

- **[TDD](https://en.wikipedia.org/wiki/Code_golf), [REPLs](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), and [short dev cycles](https://en.wikipedia.org/wiki/Rapid_application_development) are dope. 🔥🔥🔥**

- **[You aren't gonna need it](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it).** Refactor when necessary. Don't [prematurely over-optimize](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize).

- **Everything is a work in progress.** It's okay if something isn't done; few things truly are, and you probably aren't getting shot at, so... why stress so much? Be kinder to yourself.

- **Perfection isn't real.** Get as close as you want, but don't do so to your detriment.

- **[Execute](https://ask.metafilter.com/255091/Help-me-overcome-analysis-paralysis-and-be-more-process-based).**

- **C# is discount Java.** Kidding 😜. They're pretty similar, though.

- **Code explains the comments to the computer, rather than comments explaining code to the human.**
  - Comment-driven development is [not a myth](https://channel9.msdn.com/Blogs/MSDNSweden/Comment-Driven-Development-the-art-of-removal), but [a real thing that's quite powerful](https://mayaposch.wordpress.com/2017/04/09/on-the-merits-of-comment-driven-development/).

- **There's really [no perfect paradigm](https://en.wikipedia.org/wiki/Comparison_of_multi-paradigm_programming_languages#Paradigm_summaries) — just the right tool at the right moment.**
  - **There can be [more than one 'right tool.'](https://www.rosettacode.org/wiki/Rosetta_Code)**

- **[Functional programming](https://maryrosecook.com/blog/post/a-practical-introduction-to-functional-programming) is just pipelining things and ETL on a small scale.**

- **Avoid returning nulls and voids if you can. Be clear about errors. [Handle your errors](https://go.dev/blog/error-handling-and-go), Lilith.**

- **You do not need to be a brilliant wizard to code. Just persistent! And voraciously, continually learning.**
  - You may need to be a little stubborn. Masochistic, even. (Just kidding! But only slightly. It's a labor of love. 💙)

- **[Object-oriented programming](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming) is really about [sending messages around](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming).**
  - Object methods are things you *request*, not functions you apply. 🤯

- **[A factory pattern is a real thing](https://en.wikipedia.org/wiki/Factory_method_pattern), and surprisingly, not a joke.**
  - I'll stop riffing on OOP one day; it's powerful. (FP is still the future tho no cap)

- **You know those square brace things in C#? [Those are attributes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/attributes/).** And they're kinda neat. Don't think about it too much.

- **[Impostor syndrome](https://en.wikipedia.org/wiki/Impostor_syndrome) does not go away; it just gets easier to deal with. 😩** In 5 years, I'll hopefully feel differently (I haven't in 20, though; sorry to report that).

- **Whatever it is, it can probably wait.** Take some notes, save your place, and go do the other, more important thing.

- **Stay mindful of the cost of context-switching.**
  - [We are single-threaded, context-switching animals](https://en.wikipedia.org/wiki/Continuous_partial_attention). We're great at throwing all of our brainpower at one thing at a time — but we're not so great at [juggling multiple things](https://en.wikipedia.org/wiki/Human_multitasking#The_brain's_role).

`)}

  </div>
  
  <style lang='scss'>
    :global(#notes strong) {
      color: hsl(200,100%,75%);
    }
  </style>