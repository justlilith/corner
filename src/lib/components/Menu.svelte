<script lang='ts'>
import { browser } from '$app/env';
import { page } from '$app/stores';

  import { onMount } from 'svelte'
  
  export let currentPage
  
  let menuListPage:MenuLinkT[] = []

  let menuList:MenuLinkT[] = [
  { href:"/"
  , target: ""
  , title: "Journal 📜"
  , active: null
}
, { href:"/work"
, target: ""
, title: "Current and Past Work 💼"
, active: null
}
, { href:"/articles"
, target: ""
, title: "Articles 📑"
, active: null
}
, { href:"https://twitter.com/imjustlilith"
, target: "_blank"
, title: "Tweets 🕊️ :: ↗️"
, active: null
}
, { href:"https://tinyurl.com/LilithsResume"
, target: "_blank"
, title: "Resume :: ↗️"
, active: null
}
, { href:"https://github.com/justlilith"
, target: "_blank"
, title: "GitHub :: ↗️"
, active: null
}
, { href:"https://www.polywork.com/lilith"
, target: "_blank"
, title: "Polywork :: ↗️"
, active: null
}
, { href:"https://www.linkedin.com/in/lilith-dev"
, target: "_blank"
, title: "LinkedIn :: ↗️"
, active: null
}
, { href:"/spells"
, target: ""
, title: "Spells ✨"
, active: null
}
, { href:"/notes"
, target: ""
, title: "Things I wish they'd told me 🥺"
, active: null
}
, { href:"/back"
, target: ""
, title: "Back Cover 📕"
, active: null
}
]

onMount(()=> {
  // console.log(currentPage)
  menuListPage = menuList.map(item => {
    item.href == currentPage.path ? item.active = true : item.active = false
    return item
  })
})
</script>

<nav>
  <ul id='menu-list'>
    {#if browser}
    {#each menuListPage as menuItem}
    <li id={menuItem?.active ? "active-menu-item" : null}>
      <a href='{menuItem.href}' target={menuItem?.target ? menuItem.target : null}>{menuItem.title}</a>
    </li>
    {/each}
    {/if}
  </ul>
</nav>

<!-- <nav>
  <ul id='menu-list'>
    <li>
      <a href='/'>Journal 📜</a>
    </li>
    <li>
      <a href='/work'>Current and Past Work 💼</a>
    </li>
    <li>
      <a href='https://twitter.com/imjustlilith' target=_blank>Tweets 🕊️ :: ↗️</a>
    </li>
    <li>
      <a href='https://tinyurl.com/LilithsResume' target=_blank>Resume :: ↗️</a>
    </li>
    <li>
      <a href='https://github.com/justlilith' target=_blank>GitHub :: ↗️</a>
    </li>
    <li>
      <a href='https://www.polywork.com/lilith' target=_blank>Polywork :: ↗️</a>
    </li>
    <li>
      <a href='https://www.linkedin.com/in/lilith-dev' target=_blank>LinkedIn :: ↗️</a>
    </li>
    <li>
      <a href='spells'>Spells 🪄</a>
    </li>
    <li>
      <a href='notes'>Things I wish they'd told me 🥺</a>
    </li>
    <li>
      <a href='back'>Back Cover 📕</a>
    </li>
  </ul>
</nav> -->



<style lang='scss'>
  nav {
    margin-top: 180px;
    padding-top: 24px;
    padding-bottom: 24px;
    padding-right: 6vw;
    top:0vh;
    position: sticky;
    background-color: #000;
  }
  ul {
    margin:0px;
    padding:0px;
    left:0px;
  }
  nav li {
    padding-bottom:5px;
    padding-top:5px;
    list-style: none;
    text-align:right;
  }
  nav a {
    color: white;
    text-decoration: none;
  }


  #active-menu-item a {
    color:hsl(200,100%,50%);
  }
  
  li#active-menu-item {
    color:white;
    list-style-type: circle;
  }

  nav a:hover {
    color: hsl(180,100%,50%) !important;
  }

  
  @media (min-width: 666px) {
    nav {
      margin-top: 120px;
    }
  }
  
  @media (min-width: 1000px) {
    nav {
      margin-top: 180px;
      padding-top: 6vh;
      background-color: #000;
      padding-right: 32px;
    }
  }
  @media (min-width: 1800px) {
    nav {
      margin-top: 120px;
    }
  }
</style>