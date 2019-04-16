---
id: 1392
title: Microformats2, WordPress and Featured Images Classes
date: 2017-04-12T03:50:30-04:00
author: Michael Bishop
excerpt: A look at how to filter the featured image img class in WordPress to properly mark up with mf2 `u-featured`
layout: post
guid: http://miklb.com/?p=1392
permalink: /blog/2017/04/12/microformats2-wordpress-and-featured-images-classes/
mf2_cite:
  - 'a:4:{s:9:"published";s:25:"0000-01-01T00:00:00+00:00";s:7:"updated";s:25:"0000-01-01T00:00:00+00:00";s:8:"category";a:1:{i:0;s:0:"";}s:6:"author";a:0:{}}'
mf2_syndicate-to:
  - 'a:1:{i:0;s:22:"bridgy-publish_twitter";}'
mf2_syndication:
  - 'a:1:{i:0;s:51:"https://twitter.com/miklb/status/852005475042435072";}'
image: https://cdn.miklb.com/content/uploads/2017/04/12034728/mf2_feature_image.jpg
tags:
  - IndieWeb
  - mf2
  - microformats
  - WordPress
kind:
  - Article
---
In my exhuberance to post an image along with articles syndicaed from my site to Twitter, I hastily started adding the microformats2 class `u-photo`. I didn't know better. It was brought to my attention that `u-photo` is meant for actual photo posts, where the image is the primary content. An experimental mf2 class  `u-featured` for [featured images](https://indieweb.org/featured) would be more appropriate. A GitHub [issue for brid.gy](https://github.com/snarfed/bridgy/issues/741) was added, and today, `u-featured` support was added to <brid.gy> for all silos.

Which brings me to WordPress. There isn't an inherent way to add a class to a featured image when you attach it to a post from within the admin. However, I have found two different options. The first, would be to do it at the theme template level. In my case, I am now using the featured image for the image that appears above articles, and also used on the home page if in the most 3 recent articles. In my `single.php` template (actually `template-parts/content.php` but for simplicity, assume `single.php`) I have:
```
<?php if ( has_post_thumbnail() ) {
		the_post_thumbnail( 'latest-article-home' );
} ?>
```
where `latest-article-home` is the custom size. Here you can add your custom class.

```
 if ( has_post_thumbnail() ) {
		the_post_thumbnail( 'latest-article-home', array('class' => 'u-featured') );
} 
```

However, you may want to just add the class to **all featured images** in which case, you can filter `wp_get_attachment_image_attributes`. 

```
function mf2_featured_image($attr) {
  remove_filter('wp_get_attachment_image_attributes','mf2_featured_image');
  $attr['class'] .= ' u-featured';
  return $attr;
}
add_filter('wp_get_attachment_image_attributes','mf2_featured_image');
```

Why remove the filter inside the filter? I wondered the same thing, and the author of the [Stack Exchange answer](http://wordpress.stackexchange.com/a/102250) where I found this looking to filter `the_post_thumbnail` "So that it only runs once in the particular circumstance that that you want it to run". Made sense to me and works as expected.

I'm still curious if the bridgy-publish plugin should have this filter for users who may not fully understand the differences and why their featured image doesn't show up with their post,but having multiple options in the short term while that is decided is good enough™ for me. 