---
title: VS Code Eleventy Friendly YAML Front Matter Snippet
description: Quick VS code snippet for YAML front matter matching Eleventy base blog static site generator.
kind: article
date: 2019-04-15 20:27:54
tags:
  - blogging
layout: layouts/post.njk
---

As I'm moving towards finalizing my move to static site blogging with @eleventy and @netlify I wanted a quick way to write markdown posts in VS Code. When I used Jekyll I had a Text Expander snippet I cobbled together, but I no longer use their service. My basic snippets are all in Alfred but that doesn't seem like a feature that's getting much love, so I'm tenative to invest in that as a tool. Most publishing will be done via micropub anyway once everything is up and running.

Behold, a basic VS Code snippet to match the front matter in the 11ty base blog posts.

```json
"Front_Matter": {
    "prefix": "frontmatter",
    "scope": "markdown",
    "body": [
      "---",
      "title: ${1:My Post Title}",
      "description: ${2:short tweetable description.}",
      "author: Michael Bishop",
      "kind: ${3:note}",
      "date: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND",
      "tags:",
      "  - ${4:blogging}",
      "layout: layouts/post.njk",
      "---"
    ],
    "description": "Front Matter"
  }
```

On the Mac, you can find your snippets under Code -> Preferences -> User Snippets. You'll be prompted for which file to modify. I created a project specific `.code-snippets` file.

I'm sure that will expand as I figure out what I'll store in front matter this time around but a nice starting point. And wow do I see the utility in this.

[Reference Docs](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
