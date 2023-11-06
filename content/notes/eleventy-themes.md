---
title: 
layout: "layouts/article.html"
permalink: "/note/{{ page.date | unixTimestamp}}.html"
date: git Created
modDate: 
tags:
  - note
  - static-site
  - indieweb
  - eleventy
meta:
  title: 
  desc: 
  url: "{{ page.url }}"
---

11ty doesn't have the concept of themes. I'm good with that. But what I'm considering, from a data portability standpoint as well as allowing work to the site to be separate from content is the concept of a theme. And making it easier for others to use it. Trick would be to get 11ty to read content from a directory outside of `_src`. Or to have a separate repo for the posts/content and `_data` as a submodule in `_src`.

<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
