export async function load({ fetch }) {
    let contentList = [];
    const entriesResponse: Response = await fetch('/api/journal/entries');
    const entriesBodyJson = await entriesResponse.json() as { dirList: [] };
    if (entriesResponse.ok) {
        contentList = entriesBodyJson.dirList.map(async (entry: string) => {
            let res: Response = await fetch(`/api/journal/entry/${entry}`);
            const resJson = await res.json();
            return resJson
        });

        const articlePromises = await Promise.all(contentList)
        console.log(articlePromises.map((x) => x.article))

        return {
            props: {
                entryList: entriesBodyJson.dirList,
                contentList: articlePromises.map((x) => x.article)
            }
        };
    }
}