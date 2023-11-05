---
title: 
layout: "layouts/article.html"
permalink: "/note/{{ page.date | unixTimestamp}}.html"
date: git Created
modDate: 
tags:
  - note
  - test
meta:
  title: 
  desc: 
  url: "{{ page.url }}"
---

Having fun trying to figure out how to get a date for the note that I can generate a unique timestamp for. Created seems to build time. Trying `git Created` now. Note this is for Eleventy and a supplied value. I wrote a filter to convert the date to unixtime stamp for a permalink value for notes with no title.

<a href="https://brid.gy/publish/bluesky"></a>
<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>