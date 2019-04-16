---
id: 123
title: Customizing Atom Editor
date: 2016-04-22T03:15:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/customizing-atom-editor
permalink: /blog/2016/04/22/customizing-atom-editor/
tags:
  - Atom
  - development
  - productivity
kind:
  - Note
---
<p>I doubt anyone who writes code for a living or tinkers for that matter hasn’t spent more hours than they’d care to admit tweaking their editor of choice. Suffice to say, I’m in that boat all to well.</p>

<p>My current editor of choice is <a href="http://atom.io">Atom</a>. It’s open source and more than fits the customization itch.</p>

<p>Aside from deciding on which packages to use (I’ve
<a href="https://atom.io/users/miklb/stars">starred the ones I use</a>) the other element I’ve gone back and forth with is theme & syntax UI. I’ve long been a fan of both Solarized Light and Dark, but have finally settled on Atom Dark and <a href="https://atom.io/themes/oceanic-next">Oceanic Next</a>. I can also recommend <a href="https://olivermak.es">Oliver Pattison’s</a> <a href="https://atom.io/users/opattison">Newbound syntax themes</a> My dream font is Operator Mono, but until I can justify the purchase of that, I’m using <a href="http://input.fontbureau.com/info/">Input</a>.</p>

<p>One tweak I just discovered is for adjusting the font size in the panel, or the sidebar. I’d been able to easily make the font larger for code/markdown, but sometimes had to break the readers out to discern what file was what in a nested folder. To the rescue I found <code class="highlighter-rouge">atom-panel.tool-panel</code> for just that. I’m currently using <code class="highlighter-rouge">1.4em</code>. Mind you this is on my old 11 inch Air. I’ve not had as much an issue on the iMac.</p>

<p>Another tweak I’ve added to my custom <code class="highlighter-rouge">styles.less</code> file is to italicize attributes. I’m also a fan of italicized comment blocks, which is included in the snippet.</p>

<div class="language-sass highlighter-rouge"><pre class="highlight"><code><span class="na">atom-text-editor</span><span class="p">:</span><span class="o">:</span><span class="n">shadow</span><span class="err">{</span>
     <span class="nc">.entity.other.attribute-name</span> <span class="err">{</span>
         <span class="nl">font-style</span><span class="p">:</span> <span class="nb">italic</span><span class="err">;</span>
     <span class="err">}</span>

     <span class="nc">.comment</span> <span class="err">{</span>
       <span class="nl">font-style</span><span class="p">:</span> <span class="nb">italic</span><span class="err">;</span>
     <span class="err">}</span>
 <span class="err">}</span>
</code></pre>
</div>
<p>I’m sure as I expand my development world, (I have a goal to learn python by <a href="https://miklb.com/building-a-twitterbot">Building a Twitterbot</a> ) I’ll continue to tweak Atom, but for now, I’m as close to happy with an editor as I have ever been. Feel free to share with me on Twitter <a href="https://twitter.com/miklb">@miklb</a> your tips and trick.
<a href="https://brid.gy/publish/twitter"></a></p>