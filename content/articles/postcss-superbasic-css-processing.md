---
title: In Defense of PostCSS as a Super Basic CSS Processing SetUp
layout: "layouts/article.html"
permalink: "/article/postcss-superbasic-css-processing.html"
date: git Created
tags:
  - PostCSS
  - CSS
---

Over on Frontend Masters, Chris Coyier wrote up his [super basic CSS processing Setup](https://frontendmasters.com/blog/fine-ill-use-a-super-basic-css-processing-setup/) and I found myself nodding at most of his points. Not to take anything away from his suggested setup, but I use [PostCSS](https://postcss.org)in a very similar fashion. 

While Lightning CSS has minification built it and PostCSS doesn’t, Lightning CSS doesn’t have `watch` built in and requires an additional tool and config. At that point, I don’t see much difference than adding a couple of PostCSS plugins and config.

```bash
npm i -D postcss postcss-cli postcss-import postcss-preset-env cssnano
```

So yeah, there’s a few more packages to install but they’re plugins for postcss and travel well together as far as dependency management goes.

Now that we have them installed, we need a config. (`postcss.config.js`) Using Chris’s demo repo as an example

```js
module.exports = (ctx) => ({
map: ctx.options.map,
plugins: {
    ‘postcss-import’: { path: ‘css’ },
    ‘postcss-nested’: {},
    ‘postcss-preset-env’: {},
    cssnano: { preset: ‘default’ },
    }
 })
```
Note that we are setting a path to the directory of our CSS files. 

So now we can add put this in a script we can run. `-w` is for `watch`, it will watch for changes,  `-m` for `map` if that’s your thing (when using multiple CSS files/imports it’s handy for debugging, I know some folks argue against it in production) and then `-o` for `out` followed by the the filename we want for our compiled CSS.

Now we can add it to our `package.json` file.

```js
“scripts”: {
“css”: “postcss css/index.css -w -m -o style.css”
}
```
`npm run css` will build your CSS, watch for changes and update `style.css` as necessary (Control-C to exit).

Personally, I am almost exclusively building sites with [Eleventy](https://www.11ty.dev/) so I use this in conjunction with it’s `—serve` command.  This doesn’t do any “live reloading” of the styles, so yeah, occasionally I’ll need to `command R` refresh a page if I’m doing a lot of fiddling but it’s been the most rock solid experience I’ve had.

I’ll note that [PostCSS Preset-Env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env) has a lot of configuration options but I’m using the defaults. You can also provide a `.browserlistrc` file which it will use, however I’m leaving them at defaults in the example. For that matter, [PostCSS Import](https://github.com/postcss/postcss-import) allows for importing from mulitple sources including `node_modules`, however that requires a little different config.

Certainly you can add in the `live.js` Chris recommends but honestly I didn't see how it was configued in the demo.

All that said, it's nice there are multiple options to allow you to write modern CSS and let the tool handle backporting for browser support. That's what drove me to my solution in the first place.

I forked Chris' demo repo and updated it with my PostCSS solution. You can view the [sample project](https://github.com/miklb/simple-postcss-setup) on GitHub.


<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>