---
id: 116
title: Housekeeping May 2016
date: 2016-05-12T02:15:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/housekeeping-may-2016
permalink: /blog/2016/05/12/housekeeping-may-2016/
tags:
  - IndieWeb
  - jekyll
kind:
  - Note
---
<p>Figure for my own reference I should document the updates I’ve made to the site the last month.</p>

<p>I’ve written before that my primary goal with the reboot of this site is to embrace IndieWeb. The first step was <a href="https://miklb.com/finally-webmentons-with-jekyll-part-duex">receiving webmentions</a>, then sending them. Also in the process I, started an indiewebified <a href="https://github.com/miklb/jekyll-indieweb">Jekyll theme</a> (which I’m using on this site at the time of writing.) Part of that was to have better microformats in the markup.</p>

<p>The big itch that I wanted to scratch was implementing micropub to free myself from Twitter (something I’ve failed at thus far). With the help of <a href="http://voxpelli.com/2016/03/my-2015-in-indieweb/">Pelle Wessman</a> who shared n bit of yet to be public “glue” to pull together his <a href="https://github.com/voxpelli/node-micropub-express">other tools</a>, I set up my own micropub endpoint on a Heroku.<sup id="fnref:1"><a href="#fn:1" class="footnote">1</a></sup>  I still need to workout adding a syndication endpoint for Twitter so I can auto-tweet notes, but that is coming.</p>

<p>Once that was in place, I was able to use the tools <a href="https://aaronparecki.com">Aaron Perecki</a> built, <a href="https://quill.p3k.io">Quill</a> and <a href="https://quill.p3k.io">OwnYourGram</a>. Quill is a web based micropub publishing app, and OwnYourGram is a service that helps you <a href="http://indiewebcamp.com/pesos">PESOS</a> your Instagram photos to your own site<sup id="fnref:2"><a href="#fn:2" class="footnote">2</a></sup>.</p>

<p>A lot of the experiments I’ve been doing here might be overkill for a simple blog, but are great ways to expose myself to new technologies. I’ve long had an Amazon Web Services s3 bucket set up as a CDN, but had never found a workflow to efficiently use it. With the my current build/deploy process with Travis, a copy of the Instagram photo is saved to my GitHub repository via micropub. In the build script, the image is copied to the s3 bucket, then linked to the CDN.</p>

<p>The primary reason to use the CDN was I went through the steps to get 100% on Google Pagespeed (last I checked). Since the site is primarily text and is already static it ranked pretty well, but I went ahead and configured loading critical CSS<sup id="fnref:3"><a href="#fn:3" class="footnote">3</a></sup>. (I had set that up with my old Habari theme, but Google’s added a step to async load the remaining CSS). I also had to tweak caching in nginx, which while I was in there, I went ahead and set up http/2. The primary reason I moved back from GitHub pages to my VPS was to serve the site over https with a free LetsEncrypt SSL certificate.</p>

<p>Finally, I went back and forth on analytics. I don’t <em>need</em> them, but it’s nice to see what visitors are looking for and at. I poked around at some self hosted options, ultimately decided for now that for the people who don’t want to share data with Google, there are browser tools to block sending the data, which I’m OK with, therefore using GA here isn’t forcing anyone into it.</p>

<p>I still want to do a fresh design, but only after last few kinks in Jekyll-IndieWeb theme are fixed. I’ll still use the markup as the foundation, just present it differently. As always, if you have any questions, hit me on Twitter <a href="https://twitter.com/miklb">@miklb</a> or leave a webmention and I’ll do my best to reply.</p>

<p><a href="https://brid.gy/publish/twitter"></a></p>
<div class="footnotes">
  <ol>
    <li id="fn:1">
      <p>Which was my first experience with both Heroku as well as a node app. <a href="#fnref:1" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:2">
      <p>Instagram has locked you out of pushing your images from your own site to Instagram. <a href="#fnref:2" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:3">
      <p>The command line tool in <a href="https://github.com/filamentgroup/criticalCSS">Filament Group’s CriticalCSS tool</a> made that pretty trivial. <a href="#fnref:3" class="reversefootnote">↩</a></p>
    </li>
  </ol>
</div>