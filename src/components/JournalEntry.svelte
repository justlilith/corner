<script lang='ts'>
  import marked from 'marked'
  export let content
</script>
  
  <div class='journalEntry'>
    <h3>{`Entry ${content.index} :: ${content.title}`}</h3>
    <h4 class='date'>{content.date}</h4>
    {@html marked(content.body)}
    <p>Kindest,<br/>Lilith</p>
  </div>

<style lang='scss'>
  h3 {
    font-size:1.5em;
    color:hsl(180,100%,80%)
  }
  h4 .date {
    font-size:1em;
    text-align: right;
  }
  .journalEntry {
    margin-bottom: 10vh;
  }
</style>