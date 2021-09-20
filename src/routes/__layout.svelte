<script lang='ts'>
  import { onMount } from 'svelte'
  import Menu from "$lib/components/Menu.svelte";
  import LogoStamp from "$lib/components/LogoStamp.svelte";
  import * as Helpers from '$lib/ts/helpers'
  import Footer from '$lib/components/Footer.svelte';
  
</script>

<main>
  <aside>
    <LogoStamp></LogoStamp>
    <Menu></Menu>
  </aside>
  <article id='main'>
    <slot></slot>
  </article>
  <Footer></Footer>
</main>