---
title: LastFM Recently Played with Eleventy
excerpt: How I'm using Eleventy Fetch to display my recently played tracks from LastFM.
layout: "layouts/article.html"
permalink: "/article/lastfm-eleventy.html"
tags:
  - music
  - LastFM
  - Eleventy
  - pinned

meta:
  title: LastFM Recently Played with Eleventy
  desc: How I'm using Eleventy Fetch to display my recently played tracks from LastFM.
  url: "{{ page.url }}"
---

I made some improvements to my [Listening](https://michaelbishop.me/listening) page which was one of the first things I built when I got this site up and running. I've been using LastFM for years to track my listening habits and I wanted to be able to display that information on my site. I've been using the [LastFM API](https://www.last.fm/api) to pull in my recently played tracks and display them on my site.

First, using 11ty Fetch plugin I have a file in my `__data` directory `lastfm.js` that pulls in my recently played tracks from LastFM. You need to install fetch `npm install @11ty/eleventy-fetch` and then you can use it in your project. It doesn't need to be added to your `.eleventy.js` file.

{% raw %}
```js
const EleventyFetch = require("@11ty/eleventy-fetch");
require('dotenv').config();

const API_KEY = process.env.LFM_API_KEY;

module.exports = async function() {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=miklb&api_key=${API_KEY}&limit=20&format=json`;

    /* This returns a promise */
    return EleventyFetch(url, {
        duration: "1h", // save for 1 hour
        type: "json" // we’ll parse JSON for you
    });
};
```
{% endraw %}

Note I'm storing my API key in a `.env` file and using the [dotenv](https://www.npmjs.com/package/dotenv) package to load it into my project.

Then in my  [template](https://raw.githubusercontent.com/miklb/michaelbishop/main/content/pages/listening.md) I'm using the data from that file to display the recently played tracks.

One of the issues I had was that LastFM was returning duplicate tracks. I wanted to display the most recent 20 tracks but not have duplicates. I was able to use Liquid to filter the data and only display unique tracks.

{% raw %}
```liquid
{% assign recentTracks=  lastfm.recenttracks.track %}
{% assign uniqueTrackNames = "" %}
{% assign uniqueTracks ="" %}
  {% for track in recentTracks %}
  {% unless uniqueTrackNames contains track.name %}
   {% assign uniqueTrackNames = uniqueTrackNames | push: track.name %}
  {% assign uniqueTracks = uniqueTracks | push: track %} 
  {% endunless %}
  {% endfor %}
  <ul class="recently-played"> 
  {% for track in uniqueTracks offset:1  %}
```
{% endraw %}

For some reason I was getting an empty track in the first position of the array, so I'm using the `offset` filter to skip that track.

<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>