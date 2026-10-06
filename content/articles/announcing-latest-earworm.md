---
title: Announcing Latest Earworm 
excerpt: An atproto ode to This Is My Jam
date: 2026-10-06T11:56:06-04:00
permalink: "/articles/announcing-latest-earworm/"
tags:
  - article
meta:
  title: Announcing Latest Earworm
  desc: An atproto ode to This Is My Jam
---

One of the things I miss from “early Twitter” was “This Is My Jam”. A [fun little website](https://web.archive.org/web/20210926084455/https://www.thisismyjam.com/) you could post a song, “your jam.” The one stuck in your head or the hot new track from your favorite band. Or a song to tell the world you’re really feeling heartbroken.

I’ve continued to do that on Bluesky, often calling them *earworms*. Something I’ve recently listened to that I wake up the next morning with it as part of my internal soundtrack. Or a song I only caught part of flipping stations in the car. You’ve probably got an earworm right now.

I kept hoping someone would build a new version of it for Bluesky, kept my ear to the ground (pun intended) for a new atproto app. But then over the weekend folks were posting their [“My 9 Albums”](https://www.my9albums.com) which left me feeling nostalgic for TIMJ. So I did what every lazy developer does these days and fired up Claude to figure out what it would take to prototype something out. I wanted as few moving parts as possible and for it be as simple as possible with what limited open data is out there. Mostly I built it for myself and I use Apple Music but the basic premise is you can search for a song or post a link. I haven’t tested Spotify much yet, but Bandcamp links work.

The basic premise is you log in with your Bluesky account and authorize Latest Earworm to store your earworms in your own account — on your personal data server, not in my database. All you're authorizing it to do is write the earworm records and share them back to Bluesky. A record is small: the track, the artist, the album, the artwork, and a link to wherever you found it — plus a pointer back to the Bluesky post if you shared it. I tried to spell it all out on the [privacy page](https://latestearworm.com/privacy).

https://bsky.app/profile/michaelbishop.me/post/3mx34svumdy25

I opted to give this its own URL instead of on a personal subdomain because of how namespaces in lexicons work. On the off chance someone else would want to use it I didn’t want to store the tracks and metadata under my personal domain. But naming things is hard™, I didn’t want to use “Jam”, I wasn’t going to invest in a fancy TLD, and I wasn’t going to get mired down in *branding identity* on a Sunday morning project so I went with what I’ve been calling them on Bluesky. Earworms.

All of that said, I had the lightbulb moment on *why* you’d want to build on the protocol. Go back and click that This Is My Jam link up top — it’s a web.archive.org URL. The site went away, and everyone’s jams went with it.

That’s the part that got me. Latest Earworm doesn’t actually have a database. The earworms you post with it aren’t mine, they’re in your account, sitting alongside your posts. If I lose interest, or the site falls over, or you just decide it’s not for you — they’re still yours. You could pull them out tomorrow and do something else with them entirely. I didn't do that. It's baked into the protocol. It’s what happens when the data lives somewhere you already own.

I still believe in personal websites, which is why I included a web component that lets you [embed your Latest Earworm](https://latestearworm.com/embed) on your own site. I’m using it on my home page now. It’s styled to be restyled — drop it in and make it match. There are also details there on reading your (public) records directly.

Anyway, if it’s something folks use, I have a few more ideas — a feed built off the public records is the one I keep coming back to. If they don’t, I’ve learned a lot and will use it for my music sharing on social.  If you encounter a bug or have a suggestion, hit the [GitHub repo](https://github.com/miklb/latest-earworm) or @michaelbishop.me on Bluesky.

<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
<a class="u-bridgy" href="https://brid.gy/publish/bluesky"></a>
