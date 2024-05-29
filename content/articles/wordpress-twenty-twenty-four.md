---
title: My State of WordPress
excerpt: My thoughts on the state of custom WordPress theme development.
layout: "layouts/article.html"
permalink: "/article/wordpress-twenty-twenty-four.html"
date: git Created
modDate: 
tags:
  - article
  - WordPress
  - pinned

meta:
  title: My State of WordPress
  desc: My perspective on Twenty-Twenty-Four and custom block theme development .
  url: "{{ page.url }}"
---

*[I discovered WordPress late 2004. I created an account on wordpress.org in 2005. I've explored many different CMSs and frameworks, even contributed to a few. Building websites with WordPress has afforded me a journey I wouldn't trade for anything. But at the end of the day it's just a tool. ]*

[David Bushnell's](https://dbushell.com/2024/05/13/modern-wordpress-an-update/) post about the current state of WordPress themes popped up in my feed earlier this week (I'm linking to his follow-up based on inital feedback). I have had quite the opposite opinion about the state of WordPress themes.

Mind you, I have been as critical as anyone from my various little soapboxes about the changes and Full Site Editing. Blocks were maturing and growing on me, but the FSE was horrendous. So much so I pinged Matt Mullenweg on Twitter about it. That led to an opportunity to do a walk through with some folks at Automattic[^1]. I think the opportunity to see a real world user experience with someone who was as famliar with WordPress as I am was helpful. But I thought including a *beta* feature in core WordPress was counter to everything I knew about WordPress. And product development.

But it got better. And with the latest releases and Twenty-Twent-Four, I think WordPress is in a better place.

First, WordPress has always been a tool that has been used in a bazillion different ways. I've contributed my share. And earlier in its lifecylce (it just turned 21) it was a bit more frameworky for enterprising hackers. But the platform has matured. So it's quite possible WordPress is just overkill for your project at this point. I believe WordPress in it's current state is a product for regularly publshing multimedia content—allowing for some level of art direction in the editing process. Yes, all of the standard things we expect on a website like forms and shopping carts and whatnot. But at it's core WP has always been about putting words and pictures on the web. 

Second, there has always been two types of WordPress theme development. One where a designer/developer/team creates a theme for a specific client or project. Maybe use a framework like Genesis. Possibly a custom plugin for custom post types and taxonomies. The other is the theme that is created for the masses. The ones that are included in the WordPress core. Ones where most folks never touch a theme file. I'm addressing the former.

From about 5.7 to 6.3 WP was moving in a direction that was I would agree with most of what David said. But with changes in 6.4 and 6.5, I think for how Gutenberg and WordPress are evolving, Twenty Twenty-Four is a great theme that now gives "boutique" custom theme development an opportunity to flourish with the block editor. 

In my opinion Twenty-Twenty-Four is a really well designed example of how you can create your own custom block theme. A blueprint for an agency to build out their own block theme using their own design system. How to build the constraints and styles for the blocks. Predefine a color palette and typography. Predefine patterns of blocks. Add alternate styles for the blocks allowing for that art direction. Nothing precludes you from enqueing your own styles and scripts. it's just not necessary for the theme to function.

To address the shortcode syntax in the latest iterations of theme files, yeah, it's a bit to get used to. But once you start thinking of this as a block theme and not a traditional theme, it makes a little more sense. Besides, WP theme functions were all just php wrappers for core functions querying the database. This is just a different way to do it. You don't *need* to write the syntax. You can build page or pattern in the visual editor and then copy/export the code and commit it to your theme. **After** you've confirmed all of the other constraints are in place. Again, the idea behind a block theme is styling and defining the constraints of the blocks allowing them to be used in a variety of ways. Patterns are a collection of blocks. Pages are a collection of patterns.

If you start to think of the possibilites of what can be done in the browser to create a post or page, you'll see the potential of what can be done with a block theme. If you are wanting to build out a custom site that is just a bunch of fields of content and you fully control how that content is displayed on the front end, then you're probably better off with a headless CMS or static sites. I am sold on [Eleventy](https://www.11ty.dev/) and [CloudCannon](https://cloudcannon.com) for that use case[^2]. But if you want to give your client the ability to create a page that looks like a magazine spread, then WordPress is a great tool for that.

That's not to say everything is rosy. The block editor as it ships currently with WordPress does not support CSS `grid`. Everything is based on `flexbox.` If you add the [Gutenberg plugin](https://wordpress.org/plugins/gutenberg/) for bleeding edge, you will discover that grid support is being developed. For the stage of development it is in, it's fairly robust. You can build a grid container and then use either `grid` or `flexbox` containers in each grid cell. There's basic support for rows. I haven't looked at the discussions on the feature to know the full plan or when it might start to ship with core. But it will be one less hurdle for those wanting to use the block editor for more complex layouts. Another experimental feature being worked on in Gutenberg is forms. Currently you can create a basic form that either sends an email or `POST` to a URL. As with `grid` it's experimental and I have no clue to a timeline this would ship with core. But it's coming and you *can* start using it today.

There are also a few blocks that are missing from core that are common elements used in web design. Icons for one. I explored a lot of different options there and landed on [Coblocks](https://wordpress.org/plugins/coblocks/). For a couple of reasons. It's not a kitchen sink and the blocks are well designed and keep up with core. It's a GoDaddy product they have have promised[^3] not to make this into some kind of freemium model. You still have full control over style and remember, you can disable any block you don't want the content creators to have access to. Core too. Just because out of the box there are a ton of blocks and patterns doesn't mean your client sites have to have them all. Or preclude the creation of custom blocks or the addition of other blocks.

Again, this was meant to say that if you cannot set aside the way you used to do things in WordPress for the sites you were building a decade or more ago,  the Twenty-Twenty-Four theme isn't what you want. If you want to embrace the block editor and build out a custom theme for a client, you'd be hard pressed to find a better example. The biggest mistake I see folks make with WordPress is going down a dead end road of custom and "premium" theme frameworks that do not align with core development and wind up being a fork of WordPress.

Using Twenty-Twenty-Four as a blueprint for a custom block theme is a way to ensure you are in alignment with core development and have a theme that will be supported for the long term.

(Obligatory if you're looking for help migrating/adopting a block theme, or would like to explore a custom CMS solution with Eleventy, please [drop me an email](mailto:michael@webjanitor.consulting) )

[^1]: this was specific to using WP.com and not self-hosted WordPress. Disabling FSE wasn't an option.

[^2]: CloudCannon actually supports a visual editor as well but I've not explored it closely.

[^3]: Famous last words I know, but I don't see the finacial incentive for a company the size of GoDaddy to make this a freemium model. They employ folks that work on this and core and help integrate their own hosting products. I'm not saying they are altruistic, or it couldn't be sold off or left to rot, but for now it fills a niche.
 
 <a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>