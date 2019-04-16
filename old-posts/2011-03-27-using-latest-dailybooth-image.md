---
id: 177
title: Using Latest DailyBooth Image
date: 2011-03-27T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/using-latest-dailybooth-image
permalink: /blog/2011/03/27/using-latest-dailybooth-image/
tags:
  - bio-pic
  - dailybooth
  - gravatar
kind:
  - Note
---
<p>If you are not familiar with <a href="http://dailybooth.com/">Dailyboth</a>, at it’s core, it makes it easy to snap a picture of yourself and share it on the web.  They have a lot of other “social” aspects, like comments, following, etc, however I don’t really use any of those.  I started using it track my mustache growth for Movember, and then while I grew out a beard.  It’s easy and it can be fun.  I got to thinking today it would be cool if you could leverage that image else where besides within their network, and set off looking if they had an API and how might I do so.<img src="http://dailybooth.com/miklb/latest/medium.jpg" class="right" alt="miklb dailybooth" /></p>

<p>I discovered they do have a <a href="http://blog.dailybooth.com/category/api/">basic API</a>, along with some sample code in GitHub.  All I really wanted for now was a to pull my latest picture.  A little more digging, I realized I didn’t need to leverage the API, rather you can reference that image in a simple HTML <code><img /></code> tag.</p>
<pre><code><img src="http://dailybooth.com/username/latest/small.jpg" /></code></pre>
<p>You can also swap small, with medium or large.  The one  downside is that their images are not square, rather they are rectangular, which doesn’t work in most ‘profile’ environments.  I experimented with taking it a step further and using that latest image link with Gravatar, however from what I can tell, while Gravatar will allow you to choose the latest image, for performance reasons, they cache the various size images and don’t ever check that source again.</p>

<p>This may not be useful to many people, but in my case, with my ever changing long hair/short hair and various states of facial hair, I often find that I’ve had a photo on my about page that becomes outdated. When I meet someone in person, they hardly recognize me.  It happened when I met my current employer. Due to the nature of working on the web these days, in person meetings may not occur often or right away as most correspondences occur via email and the phone.  Having an outdated image that people are using as a visual reference isn’t necessarily bad, but it’s nice to be able to really put a face with a name, even if it’s from 2000 miles away.  Thus, I’ve updated my <a href="http://miklb.com/about">about me page</a> with my latest Dailybooth shot, so I don’t have to remember to change it.  I’m also experimenting with using it for the author bio pic at the bottom of posts, but as you can see, the aforementioned issue with rectangle vs square is an issue. I may investigate the CSS <code>clip</code> property for a short term solution.</p>

<p>It would be nice if there was a mashup somewhere between a service like Dailybooth and Gravatar where you could keep an up-to-date profile pic handy.  Possibly even being able to update your Twitter avatar at the same time.</p>