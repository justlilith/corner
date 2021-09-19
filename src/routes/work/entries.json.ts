import { default as fs } from 'fs'

export async function get({ params }){
  // const { slug } = params
  const dirList = fs.readdirSync('src/routes/work/entries')
  const entries = dirList.map(filename => {
    return JSON.parse(
      fs.readFileSync(`src/routes/work/entries/${filename}`,{encoding: 'utf8'})
      )
  })

  return {
    body: {
      entries
    }
  }
}