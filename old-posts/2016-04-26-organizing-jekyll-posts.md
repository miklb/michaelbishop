---
id: 120
title: Organizing Jekyll Posts
date: 2016-04-26T22:44:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/organizing-jekyll-posts
permalink: /blog/2016/04/26/organizing-jekyll-posts/
tags:
  - categories
  - jekyll
  - organization
kind:
  - Note
---
<p>Until last night, I was under the impression you had to store all of your posts as markdown files in a single directory called <code class="highlighter-rouge">_posts</code> unless you changed that in your <code class="highlighter-rouge">_config.yml</code> file (and even then, my assumption was it was still a single directory.) That said, I still sought out whether there was a way to organize them by at least year within that single folder. I’ve been blogging for 11 years this spring, and while sporadic at times, that is still a lot of posts. When I need to reference a new one, or look for something from the past, having them by year would be nice.</p>

<p>tl;dr yes, you can arbitrarily organize under the <code class="highlighter-rouge">_posts</code> folder however you want. All Jekyll looks for are markdown files with FrontMatter.</p>

<p>What I also learned, and isn’t <a href="https://jekyllrb.com/docs/variables/">well documented</a> <sup id="fnref:1"><a href="#fn:1" class="footnote">1</a></sup> is that you can create top level folders each with their own <code class="highlighter-rouge">_posts</code> sub-folder and Jekyll will read from each one, appending that folder name to the generated url for the post, i.e. a folder <code class="highlighter-rouge">foo</code> with <code class="highlighter-rouge">_posts</code> with <code class="highlighter-rouge">2016-04-26-post-title</code> would yield a URL of <code class="highlighter-rouge">example.com/foo/post-title</code> (varying by your permalink structure). Those top level folders are then treated as categories, allowing for more filtration within your templates and site organization. I can see other ways of using them, especially as I continue to move towards a more Indieweb way of doing things and more tweets originating from this site.</p>

<p>I intend to contribute my discoveries to the official documentation as soon as I can.</p>

<p><a href="https://brid.gy/publish/twitter"></a></p>
<div class="footnotes">
  <ol>
    <li id="fn:1">
      <p>Hint: it’s hidden under <code class="highlighter-rouge">page.categories</code> <a href="#fnref:1" class="reversefootnote">↩</a></p>
    </li>
  </ol>
</div>