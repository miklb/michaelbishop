---
id: 134
title: Finally Webmentions with Jekyll
date: 2016-01-30T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/finally-webmentons-with-jekyll-part-duex
permalink: /blog/2016/01/30/finally-webmentions-with-jekyll/
tags:
  - jekyll
  - webmention
kind:
  - Note
---
<p>If you can’t tell by previous posts, I’ve been working on getting
<a href="https://indiewebcamp.com/Webmention">Webmentions</a> to work with my new Jekyll site. I <em>think</em> I’ve finally nailed. If you take a look at my initial post <a href="http://miklb.com/making-the-move-to-jekyll">on moving to Jekyll</a>, there’s a link for a tutorial on using Travis CI to build a branch and move the flat files into the mater branch to be served on GitHub. With the help of a Aaron Gustafson’s <a href="https://github.com/aarongustafson/jekyll-webmention_io">Webmention.io plugin</a> I finally have it working. The trick was that the rakefile was firing in the build process too fast, so webmention.io couldn’t find the post on my domain, thus not sending the mention. My probably not so elegant solution was to put a <code class="highlighter-rouge">sleep 2m</code> in my shell script to slow things down and let GitHub catchup before firing the rakefile and sending the mentions. This post will be my final test. If all goes well, I will try and write up a more detailed explanation of what I’ve done since there’s still a lot missing for doing this with a Jekyll site.</p>

<p><a href="https://brid.gy/publish/twitter"></a></p>