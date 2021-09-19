<script lang='ts'>
  import { onMount } from 'svelte';
  
  import * as Helpers from './ts/helpers'
  
  onMount(()=> {
    Helpers.addRainbowBackground('logo')
  })
</script>

<h1 class='logo'>Lilith's Grimoire</h1>

<style lang='scss'>
  h1 {
    line-break: strict;
    margin:0px;
    top:30px;
    font-family: Garamond, 'Times New Roman', Times, serif;
    position: fixed;
    color:#0FF;
    font-size: 4em;
    left:20vw;
    width:13vw;
    text-align:right;
    // text-shadow: 0px 0px 10px #000, 0px 0px 10px #FFF;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
</style>