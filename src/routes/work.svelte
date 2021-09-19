<script lang='ts' context='module'>
  export async function load({ fetch }) {
    const entriesResponse:Response = await fetch('/work/entries.json')
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
  import Menu from "../../components/Menu.svelte";
  import Work from "../../components/Work.svelte";
  import LogoStamp from "../../components/LogoStamp.svelte";
  
  export let workEntries = [
  {
    title: "Loading. . .",
    description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
    altText: "Test post pls ignore",
    imageUrls: ["https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large"]
  }
  ]

  onMount(()=> {
    console.log(workEntries)
  })
</script>

<main>
  <aside>
    <LogoStamp></LogoStamp>
    <Menu></Menu>
  </aside>
  <article id='main'>
    <h2>Current and Past Work</h2>
    {#each workEntries as work}
    <Work {work}></Work>
    {/each}
  </article>
</main>

<style lang='scss'>
  h2 {
    margin:0px;
    padding:0px;
    margin-top:35px;
    color:#0FF;
  }
</style>