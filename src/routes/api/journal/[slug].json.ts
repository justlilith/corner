import { default as fs } from 'fs'

export async function get({ params }){
  const { slug } = params
  const article = JSON.parse(fs.readFileSync(`src/lib/journal/entries/${slug}.json`,{encoding: 'utf8'}))
  
  return {
    body: {
      article
    }
  }
}