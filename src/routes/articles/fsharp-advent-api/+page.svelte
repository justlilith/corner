<script lang='ts' context='module'>
  export async function load({ fetch }) {
    return {
      props: {
      }
    }
  }
</script>

<script lang='ts'>
  import { onMount } from 'svelte'
  import Expandable from '$lib/components/Expandable.svelte'
  import { marked } from 'marked'
  
  onMount(()=> {
  })
</script>

<h2>Fedis</h2>
<div>
  
  {@html marked(`So, you wanna learn F Sharp? And you wanna do so by building a key-value store, served via a .NET 6.0 minimal API? Then this is the perfect post for you ^_^`)}
  
  {@html marked(`By the time we finish this post, we'll have built a web API that's kinda like Redis, with F# (we'll call it Fedis). We'll be able to post key-value pairs written in JSON, or plain strings through url parameters. We'll also be able to lookup the value of keys in the store. Lastly, we'll make a couple endpoints for managing the store itself — querying all the data, and purging all the data.`)}
  {@html marked(`This tutorial assumes a basic understanding of the command line/terminal, HTTP verbs, and JSON structuring. If you get lost along the way, pop open a footnote thingy, or use your search engine of choice for a bit more background.`)}
  {@html marked(`If you get really lost and feel that this guide could use a bit more explaining, shoot me a DM on Twitter ([@imjustlilith](https://twitter.com/imjustlilith)) and I'll make this post better, while thanking you profusely.`)}
  
  {@html marked(`Let us begin.`)}
  
  <Expandable>
    <div slot="label">
      {@html marked(`But first, click me for an explanation of these footnote things!`)}
    </div>
    <div slot="content">
      {@html marked(`Throughout this post, you'll find expandable, inline footnotes for greater context regarding the preceding text. So, if something looks interesting and you want more background, click on the footnote and find out more :>`)}
    </div>
  </Expandable>
  
  {@html marked(`---`)}
  
  {@html marked(`### Getting Started`)}
  
  
  {@html marked(`Let's start by installing .NET 6.0. Head on over to [Microsoft's web page for downloading .NET 6.0](https://dotnet.microsoft.com/download/dotnet/6.0) and choose the installer or binary appropriate for your system. Download it, install .NET, and crack open a terminal.`)}
  
  <Expandable>
    <div slot="label">
      {@html marked(`What's .NET?`)}
    </div>
    <div slot="content">
      {@html marked(`.NET is a software runtime. It lets you make apps that run on multiple kinds of devices. Microsoft made it some time ago and it (plus a strong community) keeps it up to date. F# is a programming language that runs via .NET. If you wanna play with F#, you'll need to install .NET.`)}
    </div>
  </Expandable>
  
  {@html marked(`In your terminal, choose a directory to hold your project (like \`/home/$username/0projects/fedis\`, or \`$username\\Documents\\0projects\\fedis\`). Go ahead and run:`)}
  
  <div class="console">
    {@html marked(`\`dotnet new web -lang F#\``)}
  </div>
  
  {@html marked(`That'll turn your directory into a project directory, plus initialize a new empty web server (\`Program.fs\`).`)}
  {@html marked(`If you take a look at the directory structure, you'll see something like the following screenshot:`)}
  
  <img class="centered" src="/images/articles/fedis/fedis-01.jpg" alt="New F# project folder structure." title="New F# project folder structure."/>
  
  {@html marked(`Next, open your editor of choice (for me, VS Code + the Ionide extension, which I highly recommend). Go ahead and open \`Program.fs\`, and we'll explore a simple F# program.`)}
  
  {@html marked(`### F# Syntax Crash Course`)}
  
  <img class="centered" src="/images/articles/fedis/fedis-02.jpg" alt="New F# project code." title="New F# project code."/>
  
  {@html marked(`Lines 1 to 3 start with \`open\`, which means they're [import declarations](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/import-declarations-the-open-keyword). These tell the F# compiler to use functions from other namespaces or modules. If you're coming from C#, they're like the \`using\` declarations.`)}
  
  {@html marked(`Line 5 is an example of an attribute. [A lot has been written elsewhere](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/attributes) about attributes, but the short version is that attributes give the compiler some extra information about what you're doing. In this example, we have the \`[<EntryPoint>]\` attribute, which tells the compiler where to start executing code when the program is run.`)}
    
    {@html marked(`Lines 6 onward contain our actual program — a small function. Let's take this apart, too.`)}
    {@html marked(`Kinda like other languages, we start with a main function, named \`main\`.`)}
    {@html marked(`\`let\` is the keyword that defines things: a function, a variable, you name it. Also like other languages, arguments to functions follow the function itself. Here, we define those neatly as \`args\`.`)}
    {@html marked(`On line 7, we have an example of an object method: \`WebApplication.CreateBuilder(args)\`. And yes, it's using the same args we declared above.`)}
    {@html marked(`We'll briefly skip over line 10 to talk about lines 12 and 14. Line 12 is a blocking call; that means that we won't get to line 14 until it's done. And what does it do? It runs our app. \`app.Run()\` is arguable the most important part of our API; when we start it up, it'll keep running, until we close it. And when we close it, line 14 is executed, which returns 0. (F# doesn't use the \`return\` that you may find in other languages.)`)}
    {@html marked(`Now, let's talk about line 10, cause there's a lot to unpack there.`)}
    {@html marked(`Line 10 starts with a method call to our \`app\` variable. \`MapGet\` is a function that adds a route that's accessible via a GET request. (Likewise, \`.MapPost\` would add a route accessible with a POST request.) The first argument to the call is the endpoint (in this case, the web root, or, \`/\`). The second argument is the function that will handle requests made to that import.`)}
    {@html marked(`\`Func\<string\>(fun () -> "Hello World!")) |> ignore\``)}
    {@html marked(`\`Func\<string\>\` is the beginning of [a delegate (a function call treated like an object)](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/delegates). This tells the function call that a function will return a string.`)}
    {@html marked(`\`(fun () -> "Hello World!"))\` is an anonymous function; it's a lambda expression, meaning, an unnamed function executed inline.`)}
    {@html marked(`\`fun ()\` means that the function takes no arguments.`)}
    {@html marked(`\`->\` is how you separate arguments from expressions in F#.`)}
    {@html marked(`\`"Hello World!"\` is the string that's returned.`)}
    {@html marked(`\`|> ignore\` is how you discard the output of a function.`)}
    {@html marked(`Putting that all together, we're defining a string response to any GET request executed against our API server root — and that string is "Hello World!" :)`)}
    
    <Expandable>
      <div slot="label">
        {@html marked(`Objects in my functional code?`)}
      </div>
      <div slot="content">
        {@html marked(`F# uses the .NET runtime, which means it needs to be able to execute .NET modules. Hence, you can definitely use objects and stuff in your F# code.`)}
      </div>
    </Expandable>
    <Expandable>
      <div slot="label">
        {@html marked(`Where are my semicolons? Sometimes I see round braces but not every time??`)}
      </div>
      <div slot="content">
        {@html marked(`F# doesn't need semicolons to delineate code blocks. Instead, it uses indentation (like Python). Like most functional languages, arguments to functions don't need to be encapsulated within round braces — generally speaking. That's because round braces identify arguments as being part of a structure called a tuple. And a tuple is just data joined together. Some tuples have more than two parts, but most just have two.`)}
        {@html marked(`The other instances where we use round braces are when we're calling an object method (yes! You can use some OO stuff!) or where we're being very clear about what arguments are being passed to a function. Later in this guide, we will do that very thing >_0`)}
      </div>
    </Expandable>
    
    {@html marked(`---`)}
    
    {@html marked(`### Extending Our Program`)}
    
    {@html marked(`Let's go ahead and run our API, and see what happens. Crack open a terminal and execute the following:`)}
    
    <div class="console">
      {@html marked(`\`dotnet run\``)}
    </div>
    
    {@html marked(`In just a moment, our API will begin to run, with an unsecured (http://) address on port 5230 or something. Open \`http://localhost:[that port number]\` and you should see this:`)}
    
    <img class="centered" src="/images/articles/fedis/fedis-03.jpg" alt="Ayyy our API works; this screenshot is proof." title="Ayyy our API works; this screenshot is proof."/>
    
    {@html marked(`Look at what we did! It's our API, happily rumbling along.`)}
    {@html marked(`Let's give it some quirks and features.`)}
    
    {@html marked(`We'll start by adding a new line, below line 10, that looks an awful lot like it:`)}
    {@html marked(`\`app.MapGet("/api/v1.0/get/{item}", Func<string,string>(fun item -> get item) ) |> ignore\``)}
    {@html marked(`Just like line 10, we've added a handler for GET requests, but this time, on a different route. We've also added a new function, \`get\`, that does... something. I say "something" because we haven't defined the function yet. F# doesn't know what \`get\` means. Let's tell it, by making that function in another file.`)}
    {@html marked(`Create a new file next to our program file and call it, idk, Endpoints.fs. It doesn't matter what you call it as long as it ends in \`.fs\`; that's how the compiler knows it's an F# file. Additionally, open the file ending in \`.fsproj\` and add a new reference to the file we just made, above the current reference to \`Program.fs\`. Your fsproj file should look something like this now:`)}
    
    <img class="centered" src="/images/articles/fedis/fedis-04.jpg" alt="fsproj file with two references." title="fsproj file with two references."/>
    <Expandable>
      <div slot="label">
        {@html marked(`Why did we add \`Endpoints.fs\` above \`Program.fs\`?`)}
      </div>
      <div slot="content">
        {@html marked(`The order of \`Include\` declarations matters. The files are added in the order listed in the fsproj file, and since our Programs file uses the function we defined in our Endpoints file, we need to load that Endpoints file first.`)}
      </div>
    </Expandable>
    
    {@html marked(`Once that's done, let's add some changes to Endpoint.fs. We'll start by declaring a namespace; a namespace lets us group modules and functions together. Remember the \`open\` declarations from earlier? Each of those references a namespace, and then a module or namespace within that namespace, and so on. I'm gonna call my namespace l6; you can call yours whatever you want. The important thing is that we remember it for later.`)}
    {@html marked(`Next, let's define a new module — \`Endpoints\` — and define a function — \`get\`. For now, let's make it return its input.`)}
    {@html marked(`Finally, we'll go back to Program.fs and add a new \`open\` declaration. This time, we'll open our new namespace and module. See?`)}
    
    <img class="centered" src="/images/articles/fedis/fedis-05.jpg" alt="Our endpoints file above our program file." title="Our endpoints file above our program file."/>
    
    {@html marked(`Close the server by hitting Ctrl+C in the terminal window, then restart it to apply the changes we made. Navigate to \`http://localhost:[that port number]/api/v1.0/get/Surprise!\` and you should see this:`)}
    
    <img class="centered" src="/images/articles/fedis/fedis-06.jpg" alt="Web browser showing the text 'Surprise!'" title="Web browser showing the text 'Surprise!'"/>
    
    {@html marked(`Aw yiss. It's all coming together.`)}
    {@html marked(`So far, we've looked at a few features of F#, mostly regarding its syntax. Let's take what we've learned and keep building our API.`)}
    
    <Expandable>
      <div slot="label">
        {@html marked(`Why \`\<string,string\>\` on line 12?`)}
      </div>
      <div slot="content">
        {@html marked(`The function delegate shows both the arguments and the result — just like an F# type signature. Hence, we define the type of the input argument and the type of the output.`)}
      </div>
    </Expandable>
    <Expandable>
      <div slot="label">
        {@html marked(`The line we added to Program.fs has some weird \`{item}\` thing...`)}
      </div>
      <div slot="content">
        {@html marked(`That string is a route template string; anything in a set of curly braces is passed to the handler. Whatever we tack onto the end of our API url will be passed to our \`get\` function. [For more information, check out the docs](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-5.0#route-template-reference).`)}
      </div>
    </Expandable>
    

    {@html marked(`### Further Expansion`)}
    
    {@html marked(`For the sake of brevity, I'll ask you to copy and paste a couple of code blocks.`)}
    {@html marked(`Replace everything in \`Program.fs\` with the following (and I do mean everything!):`)}
    
    <div class='smallcode'>
    {@html marked(
`\`\`\` 
open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open L6.Endpoints

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)
    let app = builder.Build()

    let logger:ILogger = app.Logger

    app.MapGet("/api/v1.0/get/{item}", Func<string,string>(fun item -> get item) ) |> ignore
    app.MapGet("/api/v1.0/add/{key}={value}", Func<string, string, string> (fun key value -> add (key, value, logger) ) ) |> ignore
    app.MapPost("/api/v1.0/add/", Func<_,_> (fun body -> addPost body logger)) |> ignore
    app.MapGet("/api/v1.0/del/{item}", Func<string,string>(fun item -> del item) ) |> ignore
    app.MapGet("/api/v1.0/purge", Func<string,string> purge ) |> ignore
    app.MapGet("/api/v1.0/contents", Func<string,string> contents ) |> ignore

    app.Run()

    0 // Exit code
\`\`\``)}
    </div>

    <Expandable>
      <div slot="label">
        {@html marked(`Wait, what's \`Func\<_,_\>\` mean?`)}
      </div>
      <div slot="content">
        {@html marked(`F# discards and ignores underscores as wildcards. Normally, we define the type of data that the function will received and output. However, on this line, we tell the compiler not to care about the type of data coming in from the POST request. We also don't care about what the function handler will return. Hence, we use two underscores here.`)}
      </div>
    </Expandable>
    <Expandable>
      <div slot="label">
        {@html marked(`Why doesn't the \`purge\` line have a \`fun () ->\` shape?`)}
      </div>
      <div slot="content">
        {@html marked(`It's not necessary here :0 As a quick overview, the delegate/handler receives the data from the url. Since we didn't include the curly braces, as in the \`get\` call we discussed above, there's no need to tell the compiler to pass data to our \`purge\` function. So, no lambda expression is necessary.`)}
        <Expandable>
          <div slot="label">
            {@html marked(`Wait, so doesn't that mean we can change the \`Func\<string,string\>\` into \`Func\<string\>\`?`)}
          </div>
          <div slot="content">
            {@html marked(`Yup! Now you're thinking with F# >_0`)}
          </div>
        </Expandable>
      </div>
    </Expandable>

    {@html marked(`Also, replace everything in \`Endpoints.fs\` with the following:`)}
    
    <div class='smallcode'>
    {@html marked(
`\`\`\` 
namespace L6

open FSharp.Json
open System.Text.Json
open Microsoft.Extensions.Logging
open Microsoft.AspNetCore.Http

module Endpoints =
  let mutable store = 
    Map [ ("hello", "world") ]
  
  let get a =
    try
      let _, resp = store.TryGetValue(a)
      if isNull resp
      then "Not Found"
      else resp
    with
      | error -> error.ToString()
  
  let add (a:string, b:string, logger:ILogger) : string =
    logger.LogInformation(b)
    try
      store <- store.Add (a,b)
      "OK"
    with
      | error -> error.ToString()

  let addPost (body:JsonElement) (logger:ILogger) =
    try
      let newBody = body.Deserialize<Map<string,string>>()
      let keys = newBody.Keys
      let values = newBody.Values
      for key in keys do
        store <- store.Add(key.ToString(),newBody.Item(key).ToString())
      "OK"
    with
    | error -> error.ToString()

  let del a =
    store <- store.Remove(a)
    let res, _ = store.TryGetValue(a)
    if res
    then "Error: Value not removed! 👀"
    else "OK"

  let purge a =
    store <- Map[]
    "OK"

  let contents a =
    let mutable keys = store.Keys
    Json.serialize(store)
\`\`\``)}
    </div>

    <Expandable>
      <div slot="label">
        {@html marked(`There are round braces surrounding arguments now?`)}
      </div>
      <div slot="content">
        {@html marked(`Yes! Let's look at the addPost function. Each argument is encapsulated by round braces. These let us define the type of the argument. If the round braces didn't surround the argument, the compiler would infer that the entire function returns an \`ILogger\`, and that's not true.`)}
        {@html marked(`Similarly, the add function returns a string; the compiler knows so because we ended the line with \`: string\`. We want to avoid that inference on out addPost function.`)}
      </div>
    </Expandable>
    <Expandable>
      <div slot="label">
        {@html marked(`\`Try... with\`?`)}
      </div>
      <div slot="content">
        {@html marked(`This is the F# version of \`try...catch\` from other languages.`)}
      </div>
    </Expandable>
    <Expandable>
      <div slot="label">
        {@html marked(`\`let mutable store\`?`)}
      </div>
      <div slot="content">
        {@html marked(`Declarations in F# are immutable by default; that keeps a lot of nasty bugs out. If we want to mutate a variable, such as our store, we need to explicitly define the store as mutable.`)}
      </div>
    </Expandable>
    <Expandable>
      <div slot="label">
        {@html marked(`👀?`)}
      </div>
      <div slot="content">
        {@html marked(`It's valid.`)}
      </div>
    </Expandable>

    {@html marked(`Wow, that was a lot. Can you tell what everything above does? Let's recap a bit.`)}
    {@html marked(`We've added some more routes to our API, including a new method (POST). We've defined some new functions, too, that handle those routes. We've added some logging functionality by opening a new namespace... which reminds me. We haven't installed the FSharp.Json package yet. If we tried to run our APi again, we'd get an error. I mean, look:`)}

    <img class="centered" src="/images/articles/fedis/fedis-07.jpg" alt="Terminal showing a large red error message." title="Terminal showing a large red error message."/>

    {@html marked(`Let's install the FSharp.Json package. In a terminal, run this (and make sure the terminal's current directory is your project root):`)}

    <div class="console">
      {@html marked(`\`dotnet add package FSharp.Json\``)}
    </div>

    {@html marked(`When we run our API again, it'll work this time ^_^.`)}
    {@html marked(`So, what does it do?`)}

    {@html marked(`### A Fedis API Overview`)}
  
    {@html marked(`In short, a lot. We added new routes; I'll define them now.`)}
    {@html marked(`\`/api/v1.0/get/{item}\`: This looks up a key in the store, and returns its value.`)}
    {@html marked(`\`/api/v1.0/add/{key}={value}\`: This adds a key to the store with the given value.`)}
    {@html marked(`\`/api/v1.0/add/\`: This does the same, but as a POST request, rather than a GET request. This means that we can POST data as JSON.`)}
    {@html marked(`\`/api/v1.0/del/{item}\`: Here's an endpoint that deletes the data in the store referenced by a given key.`)}
    {@html marked(`\`/api/v1.0/purge\`: This deletes ALL of the data in the store!`)}
    {@html marked(`\`/api/v1.0/contents\`: Lastly, this lists all of the data in the store.`)}

    {@html marked(`Try to play with the endpoints! You'll see that as you add key-value pairs to the store, and call the \`contents\` API, that our store grows and grows.`)}
    {@html marked(`That's about it ^_^`)}
    
    {@html marked(`---`)}

    
    {@html marked(`### So... What's the Point?`)}
    {@html marked(`Whatever you want it to be. At the most basic level, it's a fun little project that'll get your feet wet with F#. However, if you slap some authentication on the endpoints, you could definitely use this as a sort of Redis cluster, on a micronized, volatile scale.`)}
    {@html marked(`This little API doesn't even touch on things like bouncing the data to disk (to prevent data loss in case of power failure or crashing), or sharding (replicating the data to other APIs to increase availability/lower latency), or alternate network protocols (it would be really, really fast with gRPC or protobufs). That's all left to you. This API can be the basis for exploration.`)}
    {@html marked(`How do you do all of those things in F#? What challenges will you face while doing them? What more is there to learn?`)}
    {@html marked(`However you decide to use this, I hope we've learned a few new things.`)}
    {@html marked(`Happy hacking! 💙`)}
  </div>
  
  <style lang='scss'>
    .smallcode {
      font-size: 0.85em;
      background: black;
      padding:12px;
      overflow: auto;
      max-width: 100%;
    }
    :global(pre) {
      overflow: auto;
    }
    .smallcode :global(code::before)
    , .smallcode :global(code::after)
    {
      content: none;
    }
  </style>