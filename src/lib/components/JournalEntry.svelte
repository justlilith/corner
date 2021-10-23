<script lang='ts'>
  import { browser } from '$app/env';
  
  import marked from 'marked'
  import { onMount } from 'svelte';
  export let content:JournalEntryT
  
  let entry
  onMount (async () => {
    entry.addEventListener('click', event => expandItems(event))
  })
  
  interface Event2 extends Event {
    target: HTMLElement & EventTarget2 & Element & EventTarget | null
  }
  interface HTMLElement {
    classList: DOMTokenList
  }
  interface EventTarget2 extends EventTarget {
    classList: DOMTokenList
  }
  interface DOMTokenList {
    [Symbol.iterator]():Iterator<string>
  }
  
  function expandItems (event:Event2) {
    // console.log(event)
    const classList = [...event.target?.classList]
    if (classList?.includes("info-level-1")) {
      console.log(classList)
      let target:Element = event.target
      target.setAttribute("class","info-expanded")
    } else if (classList?.includes("info-expanded")) {
      console.log(classList)
      let target:Element = event.target
      target.setAttribute("class","info-level-1")      
    }
  }
</script>

<div class='journal-entry' bind:this={entry}>
  <h3>{`Entry ${content.index} :: ${content.title}`}</h3>
  <h4 class='date'>{content.date}</h4>
  {@html marked(content.body)}
  <p>Kindest,<br/>Lilith</p>
</div>

<style lang='scss'>
  h3 {
    font-size:1.5em;
    // color:hsl(180,100%,80%)
  }
  h4.date {
    font-size:1em;
    text-align: right;
  }
  .journal-entry {
    padding-bottom: 100px;
    border-bottom: thin solid #666;
  }
  
  .journal-entry:last-of-type {
    padding-bottom: 100px;
    border-bottom: none;
  }
  :global(.info-level-1) {
    color: red;
  }
  :global(.info-expanded) {
    color: blue;
    margin: 1em 0;
  }
</style>