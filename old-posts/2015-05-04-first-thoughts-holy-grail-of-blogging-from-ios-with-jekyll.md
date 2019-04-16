---
id: 141
title: 'First Thoughts: Holy Grail of Blogging from iOS with Jekyll'
date: 2015-05-04T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/first-thoughts-holy-grail-of-blogging-from-ios-with-jekyll
permalink: /blog/2015/05/04/first-thoughts-holy-grail-of-blogging-from-ios-with-jekyll/
tags:
  - blogging
  - Dropbox
  - GitHub
  - jekyll
  - Zappier
kind:
  - Note
---
<p>I have been researching and thinking seriously about moving away from database driven blog engines to <em>static file</em> blogging for quite awhile. My extensive research has me convinced for my ideal workflow, <a href="http://jekyllrb.com">Jekyll</a> will be the answer—except for my goal to somewhat easily blog from my phone. All of the <a href="http://jekyllrb.com/docs/frontmatter/">front matter</a> could be handled by TextExpander snippets or custom keyboard shortcuts in Drafts or Editorial. The issue has been that with an iOS device, you are basically confined to using Dropbox or iCloud for the text/markdown files. Wanting to keep everything in a Git repo under version control, I hadn’t found a way to automagically push a Dropbox file to a Git repo without having an always on machine at home using some listening app like <a href="http://jekyllrb.com/docs/frontmatter/">Hazel</a> to do this. While that isn’t out of the question, I want something <strong>straight from the device</strong>.</p>

<p>Extensive Googling finally led me to Zappier. Similar to IFTTT, they have a <a href="https://zapier.com/zapbook/dropbox/github/">Github/Dropbox workflow</a> that allows you to send a pull request to Github when a new file is added to a directory in Dropbox. And while if I was simply using Github pages to host a Jekyll site, that would be the end to a simple solution.</p>

<p>However, I still want to host my own data on my own VPS (more on that later). Enter <a href="https://github.com/developmentseed/jekyll-hook">Jekyll Hook</a>, which, while not seemingly for the faint of heart, allows one to run their own “Github Pages” on their own server.</p>

<p>So, while all untested at this point, on paper it seems I can have a dedicated Dropbox folder synced with an iOS editor that when a markdown file is saved to it, Zapier will attempt to send a pull request and merge it to a Github hosted repo of my blog [footnote, possibly need to have iOS app to approve pull request but option is in the <em>recipe</em> for the workflow. I assume it will work save for any previous files by same name causing a merge conflict]. From that, the Jekyll Hook script/solution will fire and rebuild the the site, all without leaving the convenience of my iOS device.</p>

<p>Potential magic I tell you.</p>