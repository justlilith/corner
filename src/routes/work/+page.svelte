<script lang='ts' context='module'>
  export async function load({ fetch }) {
    const entriesResponse:Response = await fetch('/api/work/entries.json')
    const workEntries = await entriesResponse.json()
    if (entriesResponse.ok) {
      return {
        props: {
          workEntries: workEntries.entries
        }
      }
    }
  }
</script>

<script lang='ts'>
  import { onMount } from 'svelte'
  import Work from "$lib/components/Work.svelte";
  
  export let workEntries:WorkEntryT[] = [
  {
    index: 0,
    filename:null,
    date:null,
    title: "Loading. . .",
    description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
    imageURLs: ["https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large"]
  }
  ]
  
  onMount(()=> {
    console.log(workEntries)
  })
</script>

<h2>Current and Past Work 💼</h2>
{#each workEntries as work}
<Work {work}></Work>
{/each}

<style lang='scss'>
</style>