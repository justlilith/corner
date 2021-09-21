/// <reference types="@sveltejs/kit" />

interface JournalEntryT {
  index:int
  filename:string
  title:string
  date:string
  body:string
}

interface WorkEntryT {
  index:int
  filename:string
  title:string
  date:string
  description:string
  imageURLs:string[]
}

type DirListT = string[]

interface MenuLinkT {
  href:string
  target:string|null
  title:string
  active:boolean
}