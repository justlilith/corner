<script lang='ts'>
  import marked from 'marked'
  export let work
</script>
  
  <div>
    <!-- <h3>{work.title}</h3> -->
    <p>{@html marked(work.description)}</p>
    <img src={work.imageSrc} alt={work.altText}/>
  </div>

<style lang='scss'>
  img {
    height: 90%;
    width: 90%;
  }
</style>