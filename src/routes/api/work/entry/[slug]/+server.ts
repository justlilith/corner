import { json } from '@sveltejs/kit'
import { default as fs } from 'fs'

export async function GET({ params }){
  const { slug } = params
  const article = JSON.parse(fs.readFileSync(`src/routes/work/entries/${slug}.json`,{encoding: 'utf8'}))
  // let article
  // await fs.readFile(`src/routes/journal/posts/${slug}.json`, (err, data) => {
    // article = {"test":"test"}
    // article = data
  // })

  
  return json({
      article
    })
  }