<script lang='ts'>
  import Menu from "../components/Menu.svelte";
  import Work from "../components/Work.svelte";
  import LogoStamp from "../components/LogoStamp.svelte";
  
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
  <article>
    <h2>Prior Art</h2>
    {#each works as work}
    <Work {work}></Work>
    {/each}
  </article>
</main>

<style lang='scss'>
  :global(body) {
    padding:0;
    margin:0;
    // width:100vh;
    // height:100vw;
    font-family: 'Ubuntu', 'Fira Sans', 'Lucida Sans', Helvetica, Verdana, sans-serif;
  }

  main {
    display:grid;
    grid-template-areas: 'left right';
    height:100vh;
    width:100vw;
  }
  aside {
    background-color: #000;
    grid-area: left;
    // height:100vh;
    width:15vw;
    padding-left:20vw;
    // overflow: scroll;
  }
  article {
    color:white;
    background-color: #333;
    grid-area: right;
    // min-height:100vh;
    padding-left:5vw;
    padding-right:20vw;
    width:50vw;
  }
  h2 {
    margin:0px;
    padding:0px;
    margin-top:35px;
    color:#0FF;
  }
</style>