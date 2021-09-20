<script lang='ts'>
  import marked from 'marked'
  import { onMount } from 'svelte';
  import * as Helpers from './ts/helpers'
  
  onMount(()=> {
    Helpers.addRainbowBackground('work-images')
  })
  
  export let work
</script>

<div class='work'>
  <!-- <h3>{work.title}</h3> -->
  {@html marked(work.description)}
  {#if work["imageURLs"].length > 1}
  <div class='work-images'>
    {#each work["imageURLs"] as url}
    <img src={url} alt={work.altText || ""}/>
    {/each}
  </div>
  {:else}
  <img class='work-image' src={work["imageURLs"][0]} alt=""/>
  {/if}
</div>

<style lang='scss'>
  .work-images {
    height:50vh;
    overflow-y: scroll;
    scrollbar-width: none;
  }
  
  img {
    // object-fit: cover;
    // height: 90%;
    width: 100%;
    margin-bottom: 5px;
  }

  .work {
    padding-bottom: 100px;
    border-bottom: thin solid #666;
  }

  .work:last-of-type {
    padding-bottom: 100px;
    border-bottom: none;
  }
</style>