import { json } from '@sveltejs/kit'
import { default as fs } from 'fs'

export async function GET({ params }) {
  const { slug } = params
  const article = JSON.parse(fs.readFileSync(`src/lib/journal/entries/${slug}`, { encoding: 'utf8' }))

  return json({
    article: article
  })
}