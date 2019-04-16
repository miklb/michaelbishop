---
id: 267
title: Migrating Servers
date: 2008-04-15T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/migrating-servers
permalink: /blog/2008/04/15/migrating-servers/
tags:
  - habari
  - mediatemple
  - multi-site
  - server
  - slicehost
  - vps
kind:
  - Note
---
<p>What an experience this has been.  I hope to write a comprehensive post at some point about the experience, but suffice to say, it’s been quite the crash course on Apache, Debian, and DNS.</p>

<p>It all started with some curiosity, in which I purchased a <a href="http://slicehost.com">Slice</a>, and began poking around with the many tutorials they offer.  Ultimately, <a href="http://asymptomatic.net/">Owen</a> provided me with his LAMPME script that did the basic setup for a debain, apache2, PHP 5, MySQL 5 set up, using mod_vhost (please don’t quote me on any of this :-D ), which sorta got me going.  I got a bit sidetracked, and confused with setting up phpMyAdmin (I’m not that comfortable with CLI yet), and let the whole thing just sit, unused for a month or so.  However, due to the persistent <a href="http://weblog.mediatemple.net/weblog/category/system-incidents/gs-grid-service-intermittent-service-availability/">problems with MediaTemple</a> grid-servers, I vowed to stop shelling out money to them for the hassles.  If my sites go down, I want to be the one to blame, and no one else.  Besides, it’s high time that I learn more about this aspect of web development.<br /><br />So, armed with help from<span style="text-decoration: underline;"> </span><a href="http://skippy.net">Skippy</a>, and some new found confidence, I got everything set up so as to have a basic understanding of how/where things go, and started moving domains.  I’m just about done, with this being one of the last.  If anyone notices anything wonky, assuming I have visitors, please let me know.<br /><br />Also which is quite cool so far, is that I’m going to deploy the <a href="http://wiki.habariproject.org/en/Multisite">multi-site</a> functionality of Habari to minimize the number of actual installs I have on the server, as I run everything off of head, this means less outdated installs.  Right now I’m looking at having just 2 actual installations, with everything else running off of those.  So far it’s worked out fine, though it took a little playing to get paths for things like images and files sorted out.  More on that later.  Certainly something that needs more attention, especially as silos mature.<br /><br />Thanks to everyone who’ve helped in the process.<br /></p>