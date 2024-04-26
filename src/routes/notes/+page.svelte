<script lang="ts" context="module">
	export async function load({ fetch }) {
		return {
			props: {}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';

	onMount(() => {});
</script>

<h2>Notes 📝</h2>
<div id="notes">
	{@html marked(`
Here are some things I wish I knew before I started... well, anything! ^_^ These range from unspoken knowledge around programming paradigms to self-behavioral management. (Plus whatever else comes to mind.)

These are not maxims; they're things I remind myself of. I'm presenting them here in case they help other people as much as they help me. You may not agree, and that's totally valid! I am not an Oracle. Or Lucent. [Nor do I have 9 plans](https://en.wikipedia.org/wiki/Plan_9_from_Bell_Labs). I'm just me, and I'm still figuring out what that means.

Also, these are in no particular order. Eventually, they will be tagged and categorized. Everything is a work in progress. Oh! That reminds me!

### Let's go! 🚀🚀

- **Clarity matters more than cleverness.**
  - [Code golf](https://en.wikipedia.org/wiki/Code_golf) in prod is an [anti-pattern](https://www.bmc.com/blogs/anti-patterns-vs-patterns/).
  - Speed of code matters more than compactness of code.
  - Expeditiously written, yet elegant code is a good goal.

- **[TDD](https://en.wikipedia.org/wiki/Code_golf), [REPLs](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), and [short dev cycles](https://en.wikipedia.org/wiki/Rapid_application_development) are dope. 🔥🔥🔥**

- **[You aren't gonna need it](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it).** Refactor when necessary. Don't [prematurely over-optimize](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize).

- **Everything is a work in progress.** It's okay if something isn't done; few things truly are, so... why stress so much? Be kinder to yourself.

- **Perfection isn't real.** Get as close as you want, but don't do so to your detriment.

- **[Execute](https://ask.metafilter.com/255091/Help-me-overcome-analysis-paralysis-and-be-more-process-based).**

- **C# is discount Java.** Kidding 😜. They're pretty similar, though.

- **Try that thing you don't think you like.** You might learn something, or perhaps fall in love.

- **Code explains the comments to the computer, rather than comments explaining code to the human.**
  - Comment-driven development is [not a myth](https://channel9.msdn.com/Blogs/MSDNSweden/Comment-Driven-Development-the-art-of-removal), but [a real thing that's quite powerful](https://mayaposch.wordpress.com/2017/04/09/on-the-merits-of-comment-driven-development/).

- **There's really [no perfect paradigm](https://en.wikipedia.org/wiki/Comparison_of_multi-paradigm_programming_languages#Paradigm_summaries) — just the right tool at the right moment.**
  - **There can be [more than one 'right tool.'](https://www.rosettacode.org/wiki/Rosetta_Code)**

- **[Functional programming](https://maryrosecook.com/blog/post/a-practical-introduction-to-functional-programming) is largely pipelining and ETL on a small scale.**

- **Avoid returning nulls and voids if you can. Be clear about errors. [Or, "Handle your errors, Lilith!""](https://go.dev/blog/error-handling-and-go)**

- **You do not need to be completely brilliant to code. But you do need to be persistent! And voraciously, continually learning.**
  - You may need to be a little stubborn. It's a labor of love. 💙

- **[Object-oriented programming](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming) is really about [sending messages around](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming).**
  - Object methods are things you *request*, not functions you apply. 🤯

- **[A factory pattern is a real thing](https://en.wikipedia.org/wiki/Factory_method_pattern).**

- **You know those square brace things in C#? [Those are attributes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/attributes/).** And they're kinda neat. Investigate them!

- **[Impostor syndrome](https://en.wikipedia.org/wiki/Impostor_syndrome) lessens over time; it also gets easier to deal with the more you learn and grow.**

- **Whatever _it_ is, it can probably wait.** Take some notes, save your place, and go do the other, more important thing.

- **Stay mindful of the cost of context-switching.**
  - [We are single-threaded, context-switching animals](https://en.wikipedia.org/wiki/Continuous_partial_attention). We're great at throwing all of our brainpower at one thing at a time — but we're not so great at [juggling multiple things](https://en.wikipedia.org/wiki/Human_multitasking#The_brain's_role).

- **Always become a better asset to everyone around you.**

`)}
</div>

<style lang="scss">
	:global(#notes strong) {
		color: hsl(200, 100%, 75%);
	}
</style>
