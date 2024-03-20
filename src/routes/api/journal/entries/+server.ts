import { json } from '@sveltejs/kit'
import { default as fs } from 'fs'

export async function GET({ params }) {
  const dirList: DirListT = fs.readdirSync('src/lib/journal/entries')

  return json({ dirList })
}