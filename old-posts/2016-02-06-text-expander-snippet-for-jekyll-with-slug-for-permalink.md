---
id: 131
title: Text Expander snippet for Jekyll With Slug for Permalink
date: 2016-02-06T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/text-expander-snippet-for-jekyll-with-slug-for-permalink
permalink: /blog/2016/02/06/text-expander-snippet-for-jekyll-with-slug-for-permalink/
tags:
  - jekyll
  - 'TextExpander - javascript'
kind:
  - Note
---
<p>There are plenty of TextExpander snippets floating around for creating Jekyll Front Matter, however, I wanted to take it a step further, and auto-create a slugified permalink with no additional work. The other part of the equation was that I wanted it to be able to use it on TE touch, which meant it had to be done in javascript. After a little Googling, some trial and error, I came up with one that takes a text input for the post title, generates a slug from that, and includes the current date. I understand that the date in the file can be used, however I may not always publish when the file was initially created. Not to mention, when I imported all of my posts from Habari, I needed to be able to use the original post date, not the date the file was created, so I continue to use that. You can certainly modify the snippet for your needs.</p>

<p>Also note, I have a blank variable for <em>summary</em>. Since I’m using webmentions, I use the summary as the text for a tweet, which would be different than an excerpt. Some of this may change when I redo the site redesign, but for now, it’s how I roll.</p>

<p>I would love feedback on how to make the snippet better as it’s my first javascript snippet. Just leave a comment on the gist.</p>

<noscript><pre>var title = &#39;%filltext:name=Title%&#39;;
slug = title.replace(/[^\w\s]/gi, &#39;&#39;);
var newslug = title.split(" ").join("-");

var dt = new Date();

TextExpander.appendOutput("---\n");
TextExpander.appendOutput("layout: post \n");
TextExpander.appendOutput("title: " + &#39;"&#39; +title + &#39;"&#39;+ "\n");
TextExpander.appendOutput("tags: \n");
TextExpander.appendOutput("published: true \n");
TextExpander.appendOutput("permalink: ") +TextExpander.appendOutput(newslug.toLowerCase()); + TextExpander.appendOutput(" \n");
TextExpander.appendOutput("date: ") + TextExpander.appendOutput(dt.getFullYear() + "-" +(dt.getMonth() +1) + "-" + dt.getDate()) + TextExpander.appendOutput("\n");
TextExpander.appendOutput("summary: \n");
TextExpander.appendOutput("--- \n");

// %filltop%</pre></noscript>
<script src="https://gist.github.com/miklb/53a93032fb8cc669b1fa.js"> </script>

<p><a href="https://brid.gy/publish/twitter"></a></p>