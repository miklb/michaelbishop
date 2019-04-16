---
id: 4157
title: 'Live Testing the State of Affairs in WordPress &#038; the IndieWeb'
date: 2018-08-19T21:55:18-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/?p=4157
permalink: /blog/2018/08/19/live-testing-the-state-of-affairs-in-wordpress-the-indieweb/
mf2_mp-syndicate-to:
  - 'a:1:{i:0;s:22:"bridgy-publish_twitter";}'
mf2_syndication:
  - 'a:1:{i:0;s:52:"https://twitter.com/miklb/status/1031359000162516999";}'
  - 'a:1:{i:0;s:52:"https://twitter.com/miklb/status/1031359000162516999";}'
geo_weather:
  - 'a:2:{s:5:"units";s:1:"F";s:4:"icon";s:4:"none";}'
geo_public:
  - "1"
categories:
  - misc
kind:
  - Article
---
Suffice to say I've said a lot about WordPress and the IndieWeb. Here and in #indieweb-wordpress in IRC. But the gist is, I don't know what issues there are summer of 2018 with a core WordPress theme and the suite of IndieWeb plugins. No one seems to be able to point to anything specific.

There are efforts under way to bypass the mf2 in the markup and pass a mf2 feed for parsers to use. It is an honest attempt to find a solution right now. But the elegance of semantic classes in proper HTML5 markup is what drew me to the technology in the first place. I would hate to ditch that approach without attempting to find a solution that includes the underlying markup in WordPress themes. 

My base understanding is that there are microformats 1 in core. Over time folks have used those semantic classes as styling hooks. A [pull request was sent](https://core.trac.wordpress.org/ticket/30783) and was closed as `wontfix` due to concern of "breaking" legacy themes that used the mf1 semantic class as styling hook.

That was 2 years ago. I don't know if anything has changed since then. A lot has changed in the Indieweb landscape including improvements to backward compatibility in the mf2 parses.

So, if you consume this feed in any kind of reader and see weird output, please send a webmention to this post so I can collect them in one place and document. Feel free to send a webmention without an issue just so I can assess replies as well.

Also, if you've done this excercise in the last few months, **please** share your experience. 