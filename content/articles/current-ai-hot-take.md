---
permalink: /articles/current-ai-hot-take.html
title: Where I'm at with AI
tags:
  - AI
  - privacy
---

My extent of actively using "artificial intelligence" is limited to a few tests with chatGPT last year and the adoption of using GitHub CoPilot[^1]. I say "actively" in that its use is intentional and not just a byproduct of using a service. And while I agree with the general sentiment of folks who eschew the scraping of original content and commodification of user data, I think the technology itself is just a tool. I believe Apple is demonstrating that in their use of Apple Intelligence. I won't try to go into details, I'll defer to the excellent piece by John Gruber - [WWDC: Apple Intelligence]( https://daringfireball.net/2024/06/wwdc24_apple_intelligence).

>First, their models are almost entirely based on personal context, by way of an on-device semantic index. In broad strokes, this on-device semantic index can be thought of as a next-generation Spotlight. Apple is focusing on what it can do that no one else can on Apple devices, and not really even trying to compete against ChatGPT et al for world-knowledge context. They’re focusing on unique differentiation, and eschewing commoditization.

Had I not read Simon Willison's post this week [Building search-based RAG using Claude, Datasette and Val Town](https://simonwillison.net/2024/Jun/21/search-based-rag/) I might not have gotten it. While some of the details are over my head, the concept of taking data in an existing sqllite database and using it to "answer questions" vs generic training data is the key. The fact that it's this close to someone like me being able to take a public data set and use it to answer questions is what I'm talking about. 

And I'm cool with being able to query my own data in a natural language model. The rest is hype.


<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
<a class="u-bridgy" href="https://brid.gy/publish/bluesky"></a>

[^1]: It's great for rubber ducking and exploring new ideas. I've also used it to undo spaghetti code and debug some other folks' code. It's not going to replace anyone anytime soon.