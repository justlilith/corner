<script lang='ts'>
  import marked from 'marked'
  export let content:JournalEntryT
</script>
  
  <div class='journal-entry'>
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
</style>