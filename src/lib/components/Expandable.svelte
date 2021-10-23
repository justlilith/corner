<script lang='ts'>
  import { slide } from 'svelte/transition';
  
  import { onMount } from 'svelte';
  
  let visible = false
  
  
  onMount(()=> {
  })
</script>

<div class="expandable">
  <div class="expandable-label" on:click="{()=> {visible = !visible}}">
    <slot name="label"></slot>
  </div>
  {#if visible}
  <section class="expandable-content" transition:slide>
    <slot name="content"></slot>
  </section>
{/if}
</div>

<style lang='scss'>
  .expandable {
    margin: 0;
  }
  .expandable-label {
    background: black;
    color: hsl(0,0%,70%);
    border-left: medium solid cyan;
    padding-left:12px;
  }
  .expandable-content {
    background: hsl(0,0%,20%);
    color: white;
    padding:12px;
    // padding-left:12px;
  }
  :global(.expandable p) {
    // margin: 0;
  }
</style>