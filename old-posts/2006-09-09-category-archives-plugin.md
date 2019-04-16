---
id: 361
title: Category Archives Plugin
date: 2006-09-09T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/category-archives-plugin
permalink: /blog/2006/09/09/category-archives-plugin/
tags:
  - archive
  - category
  - geek-life
  - plugin
  - wordpress-1
kind:
  - Note
---
<p><em>(disclaimer)</em>I’m not a coder, and this is my first attempt, I apologize if this isn’t properly documented or presented.</p>

<p>My very first WordPress Plugin!  I’ve dabbled with a lot of areas of WP, but until this <a href="http://wordpress.org/support/topic/86463?replies=2">post</a> in the support forums, I never really had an idea or need to write one.  But after doing some reading, I found that there wasn’t a simple way to accomplish this task.  All of WP’s archive features  are based on date.</p>

<p>So with the help of alphaoide via #wordpress on IRC, I put together this simple plugin to accomplish the task.  It worked fine on my test site, but may need some TLC before being good to go.  Basically it outputs categories by name in an h2 tag, then lists post titles with a permalink to the post.</p>

<p>I tested this by creating a <a href="http://codex.wordpress.org/Pages#Page_Templates">Page Template</a>, then inserting the plugin code within the content div of the theme.
The code to insert is
 <code>< ?php mb_cat_archive(); ?></code>
(remove the space between the < and ?, I’m not sure why that is getting reformatted in the post)
I suppose this could be used in a sidebar, however it may create a very long list…
So to summarize, download the file, unzip, and upload to your wp-content/plugins directory.
Activate the plugin in the dashboard.  Create the page template, inserting the above code, save, and upload to your themes directory.
Go to Write->Page, and choose the template you uploaded.
The new page should now list your categories with their appropriate posts.
I haven’t looked into how it handles posts with multiple categories, that will be on my todo list, I’m sure, if the plugin proves useful or popular.  I’d also like to add some AJAX to hide the posts until you click on the category (that would make it much more sidebar friendly), and the ability to change the h2 tag to whatever one likes.</p>

<p>You can download the file via:
<a href="http://www.miklb.com/blog/cat_archive.zip">http://www.miklb.com/blog/cat_archive.zip</a></p>