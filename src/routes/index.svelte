<script lang='ts' context='module'>
  export async function load({fetch}){
    let contentList = []
    let entries
    const entriesResponse:Response = await fetch('/journal/entries.json')
    const entriesBodyJson = await entriesResponse.json()
    if (entriesResponse.ok) {
      contentList = entriesBodyJson.dirList.map(async (entry) => {
        let res:Response = await fetch(`/journal/${entry}`)
        return await res.json()
      })
      
      return {
        props: {
          entries: entriesBodyJson.dirList,
          contentList: (await Promise.all(contentList)).map(x => x.article)
        }
      }
    }
  }
</script>

<script lang='ts'>
  import JournalEntry from "../../components/JournalEntry.svelte";
  import { onMount } from 'svelte'
  // export let entries = 'ok'
  export let entries
  export let contentList
  
  // onMount(()=> {
    //   contentList = [...contentList].sort()
    // })
    
  </script>
  
  <svelte:head>
</svelte:head>

<h2>Journal</h2>
<!-- <nav id='sidebar'>
  <ul>
    {#each entries as entry}
    <li><a href={`#${entry}`}>{entry}</a></li>
    {/each}
  </ul>
</nav> -->
<article>
  {#each contentList.sort((x, y) => y.index - x.index) as content}
  <JournalEntry {content}></JournalEntry>
  {/each}
  
</article>

<style lang='scss'>
  #sidebar {
    // float:right;
    position:sticky;
    left: 30vw;
    top:0vh;
    margin-top:30vh
  }
  
  p {
    line-height: 175%;
    font-size: 1em;
  }
</style>