---
id: 315
title: Custom Style Sheets and Basecamp
date: 2007-07-16T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/custom-style-sheets-and-basecamp
permalink: /blog/2007/07/16/custom-style-sheets-and-basecamp/
tags:
  - basecamp
  - css
  - milestones
  - stylish
kind:
  - Note
---
<p>I’ve mentioned that I primarily use BaseCamp these days with the company that I work with to manage the many sites they handle.  That’s all good, but whenever I log in, I am overwhelmed with many, many, late milestones and upcoming milestones.  Sure, some of it’s relevant to me, however most is not.  Even what is relevant, I’m well aware of my tardiness.  I don’t need a constant reminder :)</p>

<p>Enter a handy little Firefox extentsion, <a href="https://addons.mozilla.org/en-US/firefox/addon/2108">Stylish</a>, that I became aware of after adopting Hicks Designs handy <a href="http://www.hicksdesign.co.uk/journal/google-reader-theme">Mac OS styled Google Reader style sheet</a>. (Note, there are instructions for using the style sheet with other browsers).</p>

<p>Another quick use of the <a href="https://addons.mozilla.org/en-US/firefox/addon/60">Web Developer extension</a> (I couldn’t live without this extension), I was able to determine the class of the milestones on the dashboard (.milestones - go figure), and add a quick display:none to a custom style for the company’s Basecamp dashboard.</p>

<p>The Stylish extension easily offers you the option of using the style for a URL, a domain, or a global style, so I can be sure that it’s only being used where and when I want.  The extension author recommends using the !important declaration, however I found no need for that with Basecamp.  Certainly worth checking out if you are looking to hide some annoying element of a site you often visit.</p>

<p><em>Edit</em>: I went ahead and changed my style to only drop the upcoming milestones, and left the overdue ones there, as that seemed more relevant to my job.  The class for that is .Dashcal.  That way, I can still see what’s overdue, and potentially avoid issues.  Upcoming milestones I’ll leave to the project manager to advise on.</p>