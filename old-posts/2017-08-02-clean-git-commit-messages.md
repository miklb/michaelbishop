---
id: 2248
title: Clean Git Commit Messages
date: 2017-08-02T18:59:10-04:00
author: Michael Bishop
layout: post
guid: http://miklb.com/?p=2248
permalink: /blog/2017/08/02/clean-git-commit-messages/
mf2_cite:
  - 'a:4:{s:9:"published";s:25:"0000-01-01T00:00:00+00:00";s:7:"updated";s:25:"0000-01-01T00:00:00+00:00";s:8:"category";a:1:{i:0;s:0:"";}s:6:"author";a:0:{}}'
mf2_syndicate-to:
  - 'a:1:{i:0;s:22:"bridgy-publish_twitter";}'
mf2_syndication:
  - 'a:1:{i:0;s:51:"https://twitter.com/miklb/status/892820476522835971";}'
categories:
  - tech-development
tags:
  - git
kind:
  - Note
---
I have been experimenting with custom git commit message templates for about 6 months, and it's been good. Comments in the template remind me to write a meaningful message and describe the commit.(That's not to say when taxed and frustrated, I don't write the ocassional `kill me now` message.)

However, in a couple of situations, my commented lines starting with # show up in the commit logs. Not pretty. So today I learned you can add `cleanup = strip` to your `.gitconfig` file, thus stripping the commented lines and clean and meaningful commit messages.



	

