<script lang='ts'>
  import { onMount } from 'svelte'
  import Menu from "../../components/Menu.svelte";
  import LogoStamp from "../../components/LogoStamp.svelte";
  import * as Helpers from '../../components/ts/helpers'

  
</script>

<main>
  <aside>
    <LogoStamp></LogoStamp>
    <Menu></Menu>
  </aside>
  <article id='main'>
    <slot></slot>
  </article>
</main>