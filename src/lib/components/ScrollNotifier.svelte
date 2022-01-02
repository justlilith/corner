<script lang='ts'>
  import { onMount } from 'svelte';
  
  import * as Helpers from '$lib/ts/helpers'
  
  onMount(()=> {
  })
</script>

<div class='scroll-notifier-wrapper'>
  <div class='scroll-notifier'>
    <span class="material-icons-outlined">expand_more</span>
    <span>Scroll Down</span>
  </div>
</div>

<style lang='scss'>
  .scroll-notifier-wrapper {
    color: #fff;
    background-color: hsla(0, 0%, 0%, 0.5);
    margin: auto;
    padding: .5em;
    position: absolute;
    text-align: center;
    width: 100%;  
  }
  
  .scroll-notifier {
    display: inline-block;
    
    span {
      display: inline-block;
      vertical-align: middle;
      user-select: none;
    }
  }
</style>