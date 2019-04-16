---
id: 113
title: Extraneous Whitespace in Jekyll HTML
date: 2016-05-14T21:03:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/extraneous-whitespace-in-jekyll-html
permalink: /blog/2016/05/14/extraneous-whitespace-in-jekyll-html/
tags:
  - HTML
  - jekyll
kind:
  - Note
---
<p>One artifact of Jekyll that has bothered me is the <a href="https://github.com/jekyll/jekyll/issues/1717">redundant blank lines</a> in the rendered HTML. In my case, I was seeing hundreds of blank lines creating the page navigation at the top of the page. It doesn’t affect what the visitor sees, but for developers who use Jekyll poor source is a bad practice. Also imagine someone new to Jekyll and HTML in general trying to view source to debug an issue. Turns out the problem is with the Liquid template language Jekyll uses. Seems the Liquid community have been <a href="https://github.com/Shopify/liquid/issues/216">discussing the issue</a> for 3 years without a solution.</p>

<p>My first approach to solving this was to use a Ruby gem <a href="https://github.com/threedaymonk/htmlbeautifier">HTML Beautifier</a>. It works great, but for a site like mine with over 500 posts with a lot of tag pages, it increases the build time exponentially. To the point I’ve seen Travis time out due to the long process. Today I went looking for another solution and stumbled upon this <a href="https://gist.github.com/kerotaa/5788650">gist - remove empty lines</a>. It concerned me the plugin would increase the build time in Jekyll vs in Travis, but was pleasantly surprised it added no noticeable overhead and produces much cleaner HTML output.</p>

<p>Now I get quick build times and cleaner source.</p>

<p><a href="https://brid.gy/publish/twitter"></a></p>