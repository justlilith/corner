export async function load({ fetch }) {
    let contentList = [];
    let entryList: DirListT = [];
    const entriesResponse: Response = await fetch('/api/journal/entries');
    const entriesBodyJson = await entriesResponse.json();
    console.log(entriesBodyJson)
    if (entriesResponse.ok) {
        contentList = entriesBodyJson.dirList.map(async (entry) => {
            let res: Response = await fetch(`/api/journal/entry/${entry}`);
            return await res.json();
        });

        return {
            props: {
                entryList: entriesBodyJson.dirList,
                contentList: (await Promise.all(contentList)).map((x) => x.article)
            }
        };
    }
}