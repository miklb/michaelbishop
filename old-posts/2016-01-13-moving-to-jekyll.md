---
id: 137
title: Making the Move to Jekyll
date: 2016-01-13T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/making-the-move-to-jekyll
permalink: /blog/2016/01/13/moving-to-jekyll/
tags:
  - blogging
  - habari
  - jekyll
kind:
  - Note
---
<p>I’ve officially made the change from Habari to Jekyll. I will certainly have more to share on the move, both a post-mortem on Habari, as well as the process I’m using currently for using Jekyll.</p>

<p>My basic workflow currently is serving the page from GitHub pages, however I’m using Travis CI to build the site and  publish to master branch<sup id="fnref:1"><a href="#fn:1" class="footnote">1</a></sup> , there by bypassing the restrictions of gh-pages (specifically, their need for using –safe mode and not up-to-date version of Jekyll). Currently my use case would probably work within their parameters, however I had already started using 3.x and at the time of writing GitHub is using 2.x.</p>

<p>More importantly to me, I want to be able to blog from my phone. It something that I feel has limited me in sharing interesting items I come across as well as stopping me from making time to put thoughts down as they come. I had originally wrote up <a href="http://miklb.com/first-thoughts-holy-grail-of-blogging-from-ios-with-jekyll">some thoughts on using iOS and Jekyll</a>, but later came across a better workflow<sup id="fnref:2"><a href="#fn:2" class="footnote">2</a></sup>.</p>

<p>Finally, there are still some wonkiness around, I’m sure my Atom feed is broken and am not sure how to redirect that yet using GitHub. I doubt I had many subscribers, so if you stumble on this and previously read my random posts, you may need to update while I investigate options. Certainly there are some styling issues that I want to address as well as some under the hood improvements.</p>

<div class="footnotes">
  <ol>
    <li id="fn:1">
      <p>This <a href="http://eshepelyuk.github.io/2014/10/28/automate-github-pages-travisci.html">tutorial</a> was an invaluable starting point. A <a href="http://mlota.github.io/2015/11/23/automating-deployment-github-pages-jekyll-travis.html">follow up tutorial from the comments</a> has great information as well. <a href="#fnref:1" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:2">
      <p>Since I already own Drafts, Workflow and Working Copy <a href="http://www.matteocappadonna.org/Posting-with-Drafts,-Working-Copy-and-Workflow">integrating all 3</a> makes sense. <a href="#fnref:2" class="reversefootnote">↩</a></p>
    </li>
  </ol>
</div>