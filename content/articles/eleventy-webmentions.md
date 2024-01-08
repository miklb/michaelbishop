---
title: Another Approach to Webmentions in Eleventy
excerpt: A quick and dirty way of using Eleventy Fetch and Liquid to display webmentions on your site.
layout: "layouts/article.html"
permalink: "/article/eleventy-webmentions.html"
date: git Created
modDate: 
tags:
  - article
  - Eleventy
  - webmentions
  - pinned

meta:
  title: Another Approach to Webmentions in Eleventy
  desc: A quick and dirty way of using Eleventy Fetch and Liquid to display webmentions on your site.
  url: "{{ page.url }}"
---

If you're not familiar with [webmentions](https://indieweb.org/Webmention), they're a way to notify another site you've mentioned them, or liked their content or whatever. It's a way to connect sites together. I've used them previously with miklb.com, but had been slow to implement them here.

As is my nature, I looked for prior art and there were a couple of really great resources. Sia has the most detailed [post](https://www.sia.codes/posts/webmentions-eleventy/) I found. However, it is written for using Nunjucks as well as a hand-rolled caching sytem. I'm using Liquid and had already experimented with using Eleventy Fetch for my [Listening](/listening/) page and LastFM data so I wanted to see if I could get away with it again.

I'll note, that over time my approach may fall over if I ever get a lot of webmentions. Sia's approach only checks for recent webmentions whereas with Fetch I'm pulling in all of them and filtering per post. Hopefully somone will see this and suggest a way to use Fetch but only check for new webmentions since last check.

Otherwise, I'm using Webmention.io same as Sia and I'd recommend using her documentation to get started.

The primary difference is I'm using Liquid to filter the webmentions per post using the [Liquid Filter](https://www.11ty.dev/docs/filters/) `where` to filter the webmentions by the `wm-target` property. Liquid also has a built in `size` filter which I'm using to display the number of webmentions. The code is still in a bit of flux but you can see my [webmentions.html](https://github.com/miklb/michaelbishop/blob/main/_includes/webmentions.html) file in my repo. I am pulling the data into a global [__data file](https://github.com/miklb/michaelbishop/blob/main/_data/webmentions.json) which makes the data available at `webmentions` in my templates.

Key bits to point out from this snippet
{% raw %}
```liquid
    {% assign webmentionUrl = site.url | append: page.url | remove: '.html' %}
    {% assign filteredWebmentions = webmentions.children | where: "wm-target", webmentionUrl %}
    {% assign likes = filteredWebmentions | where: "wm-property", "like-of" %}
    {% assign likeSize = likes | size %}
```
{% endraw %}
I use `.html` file extensions (though I do have pretty permalinks) but my `page.url` includes the file extension. YMMV but it won't hurt to include it. Second, note that with Webmentions.io, the mentions are in `webmentions.children`. `filteredWebmentions` is an object of all webmentions for the current page (or post).

From there, you can filter again by `wm-property` to separate likes, reposts, replies, etc. We can then loop through the filtered webmentions and display them as needed. {% raw %}`{% for webmention in likes %}`{% endraw %}.

As with most stuff on this site it's a work in progress but I wanted to document what I've done so far. I truly believe unlocking webmentions on more sites as we move towards federation and decentralization of the web is a good thing. I'm happy to answer any questions or help troubleshoot if you're trying to implement webmentions on your site.

<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>


