export async function load({ fetch }) {
    const entriesResponse:Response = await fetch('/api/work/entries')
    const workEntries = await entriesResponse.json()
    if (entriesResponse.ok) {
      return {
        props: {
          workEntries: workEntries
        }
      }
    }
  }