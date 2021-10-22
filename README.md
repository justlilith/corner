# Lilith's Grimoire

## Overview

This is where Lilith records her thoughts and work. It's a homepage with a few bells and whistles (choo choo!!).

## Usage

Browse, peruse, and hopefully walk away with something new. :>

## Dependencies

- SvelteKit
- Hugo
- Marked.js

## Writing a journal entry

0. Generate a new journal entry with `hugo new --kind entry journal/entries/[entry-number]-[title].md`; write your journal in markdown below the "front matter" (the section with top and bottom delineation).
1. Generate JSON for our `/journal` endpoint with `hugo`. The file will be generated in `src/lib/journal/entries`.
2. Run `npm run build` to rebuild the site.
3. Push to GitHub (or your repo host of choice) 🚀🚀
    - Assuming you've set up a Netlify pipeline, your changes will be live soon.

## Customizing the journal writing process

Hugo generates JSON based on Markdown. To modify the shape of the JSON, you'll need to edit `layouts\_default\single.journal.json`.

For more information about Hugo templating, visit the [Hugo Templates documentation](https://gohugo.io/templates/). :>