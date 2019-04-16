---
id: 1805
title: Improving the webmentions directory
date: 2017-05-20T01:19:56-04:00
author: Michael Bishop
layout: post
guid: http://miklb.com/?p=1805
permalink: /blog/2017/05/20/improving-the-webmentions-directory/
mf2_in-reply-to:
  - 'a:7:{s:9:"published";s:25:"0000-01-01T00:00:00+00:00";s:7:"updated";s:25:"0000-01-01T00:00:00+00:00";s:7:"summary";s:87:"Improving the webmentions author directory to work around WordPress&#039; shortcomings.";s:4:"name";s:35:"Improving the webmentions directory";s:8:"category";a:5:{i:0;s:11:"development";i:1;s:8:"indieweb";i:2;s:3:"php";i:3;s:11:"webmentions";i:4;s:9:"wordpress";}s:11:"publication";s:15:"Social Thoughts";s:3:"url";s:72:"https://colinwalker.blog/2017/05/19/improving-the-webmentions-directory/";}'
mf2_syndicate-to:
  - 'a:1:{i:0;s:4:"none";}'
categories:
  - misc
tags:
  - Uncategorized
kind:
  - Reply
---
Just wanted to clarify, WordPress core functionality doesn't convert a reply webmention to a standard comment, that is done with the webmention plugin. I *believe* part of that is so you can do a webmention reply to a reply, and as mentioned, the fact that `custom comment type` isn't fully fleshed out. There was work on it, a feature plugin for it, but it has since languished, despite David Shanske's attempts to move the needle forward.

I don't think we will see much movement on it until webmentions reach a crtiical mass, hopefully <https://micro.blog> will help with that.