<script lang='ts'>
  import { onMount } from 'svelte'
  import Menu from "$lib/components/Menu.svelte";
  import LogoStamp from "$lib/components/LogoStamp.svelte";
  import * as Helpers from '$lib/ts/helpers'
  import Footer from '$lib/components/Footer.svelte';
  import { page } from '$app/stores'

  let currentPage

  page.subscribe((page) => {
    currentPage = page
  })

  onMount(()=> {
    Helpers.addRainbowBackground('rainbow-strip')
  })

</script>

<main>
  <aside>
    <LogoStamp></LogoStamp>
    {#key currentPage}
    <Menu {currentPage}></Menu>
    {/key}
  </aside>
  <div id='rainbow-strip' class='rainbow-strip'></div>
  <article id='main'>
    <slot></slot>
  </article>
  <Footer></Footer>
</main>