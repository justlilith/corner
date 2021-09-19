import { default as fs } from 'fs'

export async function get({ params }){
  // const { slug } = params
  const dirList = fs.readdirSync('src/routes/journal/entries')
  // let article
  // await fs.readFile(`src/routes/journal/posts/${slug}.json`, (err, data) => {
    // article = {"test":"test"}
    // article = data
  // })

  
  return {
    body: {
      dirList
    }
  }
}