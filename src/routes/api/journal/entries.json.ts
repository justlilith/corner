import { default as fs } from 'fs'

export async function get({ params }){
  const dirList:DirListT = fs.readdirSync('src/lib/journal/entries')
  
  return {
    body: {
      dirList
    }
  }
}