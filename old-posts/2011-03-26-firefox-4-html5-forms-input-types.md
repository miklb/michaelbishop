---
id: 178
title: 'Firefox 4 HTML5 Forms &#8211; Input Types'
date: 2011-03-26T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/firefox-4-html5-forms-input-types
permalink: /blog/2011/03/26/firefox-4-html5-forms-input-types/
tags:
  - browser
  - firefox-4
  - forms
  - html5
  - input
  - support
  - type
  - validation
kind:
  - Note
---
<p>Speaking of Firefox 4, I’ve gotten a few comments on my post about <a href="http://miklb.com/firefox-4-app-tab">Firefox 4 app tabs</a>, and while trying to respond, I discovered another new ‘feature’ in Firefox 4, support for HTML 5 input types.  Inadvertently I was using the same input for my URL field as my email. I had created some custom formcontrols for  <a href="http://wiki.habariproject.org/en/Dev:FormUI">Habari’s FormUI templates</a> for HTML5 support, which had the right input types, so at first I didn’t see why I was getting the error. However with help in Habari’s IRC channel from Mike Lietz, he pointed out in my theme.php file I was calling the email formcontrol for URL as well as Email.  Fixing that, I was able to submit my comment.</p>

<p><img src="http://miklb.com/user/images/html5_input-type_email.png" alt="Firefox4 HTML 5 input type email error" class="right" />A quick Google search turned up that , indeed, <a href="https://developer.mozilla.org/en/HTML/HTML5/Forms_in_HTML5">Gecko 2 (Firefox 4) supports HTML5 input types</a>.  I had also checked in Chrome 10.x and it too gave the same error, which means it also supports the input types. IE 9 nor Safari 5 have support for the input types (Mac, ironically the Windows version seems to support it).  Finally, Opera 10 has supported this for a while, as well as iOS Safari.</p>

<p>So what does it all mean?  Why use it if it’s not really supported in all major browsers?  Well, first, using <code> type="email"</code> or <code>type="url"</code> won’t break anything. Browsers that don’t support it treat it like a text input.  But those that do, well, as you can see in the screenshot, you get instant validation without any heavy lifting by your site.  As support grows, you won’t have to update any code.  iOS Safari support includes providing a different default keyboard layout (the ampersand and .com keys are on the home screen). I can’t speak to Android’s browser, though I’d suspect it has similar behavior.  Really there’s no reason <em>not</em> to start using them.</p>

<p>Additional Resources:</p>

<ul>
  <li><a href="http://diveintohtml5.org/forms.html">Dive Into HTML5 - Web Forms</a></li>
  <li><a href="http://www.quirksmode.org/html5/inputs.html">Quirksmode - HTML5 tests - inputs</a></li>
  <li><a href="http://blog.mozilla.com/webdev/2011/03/14/html5-form-validation-on-sumo/">Mozilla Support - HTML5 Form Validation</a></li>
  <li>,<a href="http://wufoo.com/html5/">Wufoo - Current State of HTML5 Forms</a></li>
</ul>