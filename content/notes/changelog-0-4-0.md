---

title: Changelog 0.4.0
permalink: /notes/changelog/0.4.0/
tags:
  - CSS
  - changelog
lede: Scraped my handrolled grid and colors for Utopia and Adam Argyle's color scheme builder.
meta:
    - title: Changelog 0.4.0
    - desc: Scraped my handrolled grid and colors for Utopia and Adam Argyle's color scheme builder.
---

I'm still not sure how I want this site to look, but I've been more focused on a foundation and less on content and "design." I like simple. I'm not sure if what I've done is simple, more like raw. But I have fallen in love wtih [Utopia](https://utopia.fyi/) and this [color scheme builder](https://web.dev/articles/building/a-color-scheme) from Adam Argyle. What I like about both are they aren't "frameworks" or "libraries". It's all just CSS custom properties that you can use in however you mark up your templates platform agnostic.

Utopia has a PostCSS plugin however it didn't work for me. I put off debugging that for a future project and copied and pasted the generated properties. I also need to do some more reading about `subgrid` as I'm not sure it behaves how I expect.

I found Adam's post after [reading about `color-mix` palettes](https://developer.mozilla.org/en-US/blog/color-palettes-css-color-mix/). But I like how Adam's system has worked out text vs background and handles light and dark themes. All based on the HSL values for a primary—brand—color. I'm a `prefers-color-scheme: dark` user, so extra apologies to anyone viewing this in light mode. But now I can start to think about content and how I want to post. I'm thinking [Indiekit](https://getindiekit.com). Paul just published an Eleventy preset plugin. Really just need to get it up and running.

Which I'll end with a reminder from [Jeremy Keith](https://adactio.com/journal/20968) from his IndieWebCamp wrap-up (organized by the aforementioned Paul Robert Lloyd)—"What you do with your own website is entirely up to you."

@todo: fix webmention display
@todo: resolve permalink for notes (unix timestamp from gitCommitDate is fragile in CI/CD)



<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
<a class="u-bridgy" href="https://brid.gy/publish/bluesky?bridgy_omit_link=maybe"></a>