---
id: 103
title: Plans for Jekyll IndieWeb Project
date: 2016-06-15T15:17:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/plans-for-jekyll-indieweb-project
permalink: /blog/2016/06/15/plans-for-jekyll-indieweb-project/
tags:
  - IndieWeb
  - jekyll
kind:
  - Note
---
<p>I started a project soon after I began embracing the IndieWeb for the Jekyll platform, <a href="https://github.com/miklb/jekyll-indieweb">Jekyll IndieWeb</a> (A less than inspiring project name I’m afraid to say.) My initial goals were to have a framework for myself that was fully microformats 2 compliant to build my own site off of and to share a starting point for anyone new to having their own website and wanting to embrace IndieWeb themselves.</p>

<p>So far I know of one person who is using it, which is encouragement enough to continue looking at ways to improve it. In the upcoming release of Jekyll, themes will be supported. While considered a minor enhancement, I think its a major milestone for Jekyll. Previously, there was no simple way to change the look and feel of your site without manually copying files into your install. Most theme projects are packaged as standalone Jekyll builds.</p>

<p>So that said, my plan moving forward to is to package the microformated theme, complete with the same config options as a Gem under the name “Crier” (as in town crier. Not sure it’s anymore imaginative than the original project.) The original GitHub project will switch to the Gem once the new version is released, but will stay as a standalone Jekyll install for anyone who wants to get started from scratch. Also, Tom began working implementing a webmention gem for sending while at <a href="https://herestomwiththeweather.com/2016/06/07/indieweb-summit-2016-demos/">IndieWeb Summit 2016</a>. With the help of Bear in the IndieWeb community, I hope to have a tutorial and example of using continuous integration to build and deploy a site back to GitHub allowing the sending of webmentions along with the already supported receiving.</p>

<p>I would love to hear from anyone else interested in the project or using it, and what else you would like to see. Long term goal is micropub support.</p>

<p><a href="https://brid.gy/publish/twitter"></a></p>