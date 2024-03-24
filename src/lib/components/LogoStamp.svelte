<script lang='ts'>
  import { onMount } from 'svelte';
  
  import * as Helpers from '$lib/ts/helpers'
  
  onMount(()=> {
    document.getElementById('logoStamp').setAttribute('id', '')
    Helpers.addRainbowBackground('logo')
  })
</script>

<h1 class='logo' id='logoStamp'><a href="/">Lilith's Grimoire</a></h1>

<style lang='scss'>
  a {
    text-decoration: none;
  }
  h1 {
    color:#0FF;
    font-family: Garamond, 'Times New Roman', Times, serif;
    font-family: 'Montserrat', 'Open Sans', Helvetica, sans-serif;
    font-size: 4em;
    line-break: strict;
    max-width: 333px;
    margin:0px;
    position: fixed;
    right:6vw;
    text-align:right;
    top:24px;
    // text-shadow: 0px 0px 20px #000, 0px 0px 100px #CCC;
  }
  
  h1.logo {
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }

  h1#logoStamp {
    color:#0FF;
    -webkit-text-fill-color: #0FF;
  }
  
  @media (min-width: 666px) {
    h1 {
      max-width:100%;
    }
  }
  
  @media (min-width: 1000px) {
    h1 {
      margin:0px;
      max-width:333px;
      right:calc(70% + 32px);
      top:32px;
    }
  }

@media (min-width: 1800px) {
  h1 {
    max-width:100%;
  }
}
</style>