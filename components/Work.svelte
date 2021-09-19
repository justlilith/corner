<script lang='ts'>
  import marked from 'marked'
  export let work
</script>
  
  <div>
    <!-- <h3>{work.title}</h3> -->
    {@html marked(work.description)}
    <div>
      <!-- {#each work.imageURLs as url} -->
      <!-- <img src={url} alt={work.altText || ""}/> -->
      <!-- {/each} -->
      <img src={work.imageURLs[0]} alt={work.altText || ""}/>
    </div>
  </div>

<style lang='scss'>
  img {
    height: 90%;
    width: 90%;
  }
</style>