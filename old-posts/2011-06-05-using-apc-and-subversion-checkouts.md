---
id: 173
title: Using APC and Subversion Checkouts
date: 2011-06-05T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/using-apc-and-subversion-checkouts
permalink: /blog/2011/06/05/using-apc-and-subversion-checkouts/
tags:
  - apc
  - ctime
  - linode
  - mtime
  - php
  - slicehost
  - subversion
  - wordpress-1
kind:
  - Note
---
<p>I am in the process of moving my sites from Slicehost to Linode, as most are aware Slicehost is being phased out for Rackspace Cloud.  Anyway, I upgraded my VPS at Linode last night to Debian “Squeeze” and installed APC, which created a problem with the WordPress installations I had there.  Basically, I couldn’t access the admin.  Through the power of Twitter and the invaluable help of <a href="http://markjaquith.com/">Mark Jaquith</a>, I learned that by default APC doesn’t play nice with files that are checked out via Subversion.  I think the root of my problem was a stray apc config for overriding include once, but certainly the subversion issue could have been at play too.</p>

<p>Anyway, a little Googling on the subject, I discovered there’s a configuration option for APC to use <a href="http://www.php.net/manual/en/apc.configuration.php#ini.apc.stat-ctime">ctime</a>  instead of the default mtime.  Adding <code class="highlighter-rouge">apc.stat_ctime=1</code> is all that is required.</p>

<p>While I’m on the subject of migrating from Slicehost to Linode, <a href="http://developerkarma.com/">Andrew RIley</a> pointed out that someone had written a ruby script to <a href="https://github.com/Schultz/slicedns2linode">migrate the DNS information</a> for you.</p>

<p><em>Addendum</em> To be clear, I install WordPress using Subversion and the appropriate tag. My Habari installs are also all Subversion checkouts from trunk.</p>