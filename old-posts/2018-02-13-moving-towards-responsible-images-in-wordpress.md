---
id: 3446
title: Moving Towards Responsible Images in WordPress
date: 2018-02-13T16:29:37+00:00
author: Michael Bishop
layout: post
guid: https://miklb.com/?p=3446
permalink: /blog/2018/02/13/moving-towards-responsible-images-in-wordpress/
mf2_mp-syndicate-to:
  - 'a:1:{i:0;s:22:"bridgy-publish_twitter";}'
geo_weather:
  - 'a:1:{s:5:"units";s:1:"F";}'
geo_timezone:
  - Africa/Abidjan
mf2_syndication:
  - 'a:1:{i:0;s:51:"https://twitter.com/miklb/status/963449845934710784";}'
categories:
  - misc
kind:
  - Note
---
Yesterday I [mentioned](https://miklb.com/blog/2018/02/12/3430/) I was looking for a way to optimize images for posting via iOS. This morning I discovered that ImageOptim has an [API](https://imageoptim.com/api/post?username=) and a corresponding [WordPress plugin](https://wordpress.org/plugins/winsite-image-optimizer/) 

<img src="https://miklb.com/content/uploads/2018/02/wsi-imageoptim-ImageOptim_API_Dash.png" alt="ImageOptim dashboard showing 80% reduction in size on 5 images" width="1008" height="342" class="u-featured alignnone size-full wp-image-3447" />

Couple that with the S3 offload for images I'm already doing, it's looking like a nice path towards serving responsible image file weight without a lot of manual twiddling.

Caveat is there is a $9 a month fee, but that coves 1000 optimizations a month. I won't be posting anywhere near that many images, even if I do it across multiple sites. I'm on the free trial but it's a bit vague what the trial length is or if there is a certain number of optimizations before the fee kicks in. Then I'll decide if the efficiency is worth a couple of cups of coffee a month.