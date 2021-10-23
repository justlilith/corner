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
  import marked from 'marked'
  
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
  
  
  {@html marked(`Let's start by installing .NET 6.0. Head on over to [Microsoft's web page for downloading .NET 6.0](https://dotnet.microsoft.com/download/dotnet/6.0) and choose the installer or binary appropriate for your system. Download it, install .NET, and crack open a terminal.`)}
  
  <Expandable>
    <div slot="label">
      {@html marked(`What's .NET?`)}
    </div>
    <div slot="content">
      {@html marked(`.NET is a software runtime. It lets you make apps that run on multiple kinds of devices. Microsoft made it some time ago and it (plus a strong community) keeps it up to date. F# is a programming language that runs via .NET. If you wanna play with F#, you'll need to install .NET.`)}
    </div>
  </Expandable>
  
  {@html marked(`In your terminal, choose a directory to hold your project (like \`/home/$username/0projects/fedis\`, or \`$username\\Documents\\0projects\\fedis\`). Go ahead and run`)}
  <div class="console">
    {@html marked(`\`dotnet new web -lang F#\``)}
  </div>
  {@html marked(`That'll turn your directory into a project directory, plus initialize a new empty web server (\`Program.fs\`).`)}
  {@html marked(`If you take a look at the directory structure, you'll see something like the following screenshot:`)}
  
  <img src="/images/articles/fedis/fedis-01.jpg" alt="New F# project folder structure." title="New F# project folder structure."/>
  
  {@html marked(`Next, open your editor of choice (for me, VS Code + Ionide). Go ahead and open \`Program.fs\`, and we'll explore a simple F# program.`)}
  
  <img src="/images/articles/fedis/fedis-02.jpg" alt="New F# project code." title="New F# project code."/>
  
  {@html marked(`Lines 1 to 3 start with \`open\`, which means they're [import declarations](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/import-declarations-the-open-keyword). These tell the F# compiler to use functions from other namespaces or modules. If you're coming from C#, they're like the \`using\` declarations.`)}
  
  {@html marked(`Line 5 is an example of an attribute. [A lot has been written elsewhere](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/attributes) about attributes, but the short version is that attributes give the compiler some extra information about what you're doing. In this example, we have the \`[<EntryPoint>]\` attribute, which tells the compiler where to start executing code when the program is run.`)}
    
    {@html marked(`Lines 6 onward contain our actual program — a small function. Let's take this apart, too.`)}
    {@html marked(`Kinda like other languages, we start with a main function, named \`main\`.`)}
    {@html marked(`\`let\` is the keyword that defines things: a function, a variable, you name it. Also like other languages, arguments to functions follow the function itself. Here, we define those neatly as \`args\`.`)}
    {@html marked(`On line 7, we have an example of an object method: \`WebApplication.CreateBuilder(args)\`. And yes, it's using the same args we declared above.`)}
    {@html marked(`We'll briefly skip over line 10 to talk about lines 12 and 14. Line 12 is a blocking call; that means that we won't get to line 14 until it's done. And what does it do? It runs our app. \`app.Run()\` is arguable the most important part of our API; when we start it up, it'll keep running, until we close it. And when we close it, line 14 is executed, which returns 0. (F# doesn't use the \`return\` that you may find in other languages.)`)}
    {@html marked(`Now, let's talk about line 10, cause there's a lot to unpack there.`)}

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
    
    
    
  </div>
  
  <style lang='scss'>
  </style>