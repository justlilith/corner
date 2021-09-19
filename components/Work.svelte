<script lang='ts'>
  import marked from 'marked'
  import { onMount } from 'svelte';
  import * as Helpers from './ts/helpers'
  
  onMount(()=> {
    Helpers.addRainbowBackground('work-images')
  })
  
  export let work
</script>

<div>
  <!-- <h3>{work.title}</h3> -->
  {@html marked(work.description)}
  <div class='work-images'>
    {#each work["imageURLs"] as url}
    <img src={url} alt={work.altText || ""}/>
    {/each}
    <!-- <img src={work["imageURLs"]} alt=""/> -->
  </div>
</div>

<style lang='scss'>
  .work-images {
    height:50vh;
    overflow: scroll;
    scrollbar-width: none;
  }
  
  img {
    // object-fit: cover;
    // height: 90%;
    width: 100%;
    margin-bottom: 20px;
  }
</style>