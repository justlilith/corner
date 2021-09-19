<script lang='ts'>
  import Menu from "../../components/Menu.svelte";
  import Work from "../../components/Work.svelte";
  import LogoStamp from "../../components/LogoStamp.svelte";
  
  let works = [
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large",
      altText: "Test post pls ignore"
    },
    {
      title: "Test",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageSrc: "images/test.jpg",
      altText: "Test post pls ignore"
    }
  ]
</script>

<main>
  <aside>
    <LogoStamp></LogoStamp>
    <Menu></Menu>
  </aside>
  <article id='main'>
    <h2>Prior Art</h2>
    {#each works as work}
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