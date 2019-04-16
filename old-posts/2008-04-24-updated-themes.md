---
id: 265
title: Updated Themes
date: 2008-04-24T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/updated-themes
permalink: /blog/2008/04/24/updated-themes/
tags:
  - habari
  - harvest-field
  - mzingi
  - swanky
  - theme
kind:
  - Note
---
<p>I’ve been quite lazy (or busy, you decide) lately, and have been meaning to update the 3 themes I’ve released to work with the latest trunk.  Previously, I kept decent todos and a svn repo for mzingi, but this time I simply bore down in some late night frenzy and got everything up-to-date.  I’ve got a new svn repo to work with, and will check them in at some point in the next few days, and hopefully will be able to better outline any changes.</p>

<p>Basically the changes to mzingi were minor, just a few code changes for things like atom links, and updating the YUI fonts and style sheet.  I also added some styling for draft posts.</p>

<p>As far as swanky and Harvest Field, they have more extensive changes, most evident in the sidebar content.  Harvest Field now only uses built in code for the footer content – the about, recent comments and more posts links.  The sidebar in Harvest Field is entirely plugin reliant now, sans the search and subscribe link.  It supports by default the Twitter, linkoid (for aside like posts - which is also excluded from the more posts offset) and the very nifty blogroll plugin.  All three have their own templates in the theme.  I also added support for the credits due plugin, with a built in page template, and conditional code in the footer.  Also, I <em>borrowed</em> the watermark for draft posts from <a href="http://twofishcreative.com/michael/blog/connections">michaeltwofish’s connections theme</a>, and a little more emphasis on comments in moderation styling.</p>

<p>Swanky was also updated to use the current Twitter plugin/template, as well as added support for the blogroll plugin.  If these plugins are not active, nothing will show, nothing will break.  Recommended plugins are listed on the themes page.  As with Harvest Field, the draft watermark and comments in moderation were addressed.</p>

<p>As usual, if you find a bug, or would like to see something added/need help, please leave a comment either on this post or the original post for the theme in question.</p>

<p>So without further ado :</p>
<ul>
<li><a href="http://miklb.com/swanky-theme">swanky</a></li>
<li><a href="http://miklb.com/mzingi">mzingi</a></li>
<li><a href="http://miklb.com/harvest-field-a-new-habari-theme">Harvest Field</a></li>
</ul>
<p>Also, I’m putting the finishing touches on a demo site, which I’ll be adding links to the aforementioned theme posts.  Just need to decide how I want to add the theme switcher code (I’m trying to decide between adding a new fixed element at the top of each theme, or simply adding the dropdown to each sidebar).</p>

<p>As always, much thanks go to the community for the help and assistance in putting these together.</p>

<p><em>Edit</em> Twitter, linkoid, blogroll, and credit due plugins can be downloaded from <a href="http://www.habariproject.org/dist/plugins/">Habari extras</a></p>

<p><em><strong>Second Edit</strong></em> To clarify the “Credits” <em>feature</em> is accomplished by 1)activating the creditsdue plugin from extras 2)create a page with the slug “credits”, you can add additional content to the page if you want 3) there is no three (I’ve always wanted to say that!).</p>