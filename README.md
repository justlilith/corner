# Lilith's Corner

[![Netlify Status](https://api.netlify.com/api/v1/badges/290b8dbe-863a-4b18-bf21-f54faf377eb8/deploy-status)](https://app.netlify.com/sites/jl-a500d3/deploys)

## Overview

This is where Lilith records her thoughts and work. It's a homepage with a few bells and whistles (choo choo!!).

Browse, peruse, and hopefully walk away with something new. :>

## Development

The corner is built with SvelteKit, so `npm run dev` starts a dev server, and `npm run build` builds the site for production.

## Built with:

- [SvelteKit](https://kit.svelte.dev/)
- [Hugo](https://gohugo.io/) (for journaling)
- [Marked.js](https://marked.js.org/) (for interpolation)

## Writing a journal entry

0. Generate a new journal entry with `hugo new --kind entry journal/entries/[entry-number]-[title].md`; write your journal in markdown below the "front matter" (the section with top and bottom delineation).
1. Generate JSON for our `/journal` endpoint with `hugo`. The file will be generated in `src/lib/journal/entries`.
2. Run `npm run build` to rebuild the site.
3. Push to GitHub (or your repo host of choice) 🚀🚀
    - Assuming you've set up a Netlify pipeline, your changes will be live soon.

## Customizing the journal writing process

Hugo generates JSON based on Markdown. To modify the shape of the JSON, you'll need to edit `layouts\_default\single.journal.json`.

For more information about Hugo templating, visit the [Hugo Templates documentation](https://gohugo.io/templates/). :>