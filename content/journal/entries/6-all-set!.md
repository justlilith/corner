---
title: "All Set!"
date: 2021-09-20T23:15:36-05:00
draft: true
index: 6
outputs: journal
---

# All Set~

<div class='image-small'>

![Journal entry 6 splash image, of Shyoko from Happy Sugar Life, representing my current shock that this works at all!](images/journal/6-all-set!/6-splash.jpg)

</div>

Well, everything seems to be working well. Welcome to the new version of my site. I've migrated the CMS and UI from Tumblr to a custom solution. Right now, this site is made via:

- SvelteKit
- Hugo
- Marked
- Netlify

I write journal entries in Markdown, which is wrapped by Hugo into JSON. SvelteKit serves that JSON via a Netlify functions endpoint. Next, the static SvelteKit site rips the Markdown from the JSON, at which point marked renders it into HTML.

So, I write an entry, run Hugo, push to GitHub, and the site is updated (Netlify is the backend for everything and runs via repo triggers). ezpz. 💙