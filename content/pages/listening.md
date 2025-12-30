---
layout: layouts/default.html
title: Listening
permalink: "listening.html"
date: git Created
eleventyNavigation:
  key: Listening
  order: 4
meta:
  title: Listening
  desc: What I'm listening to and tales of shows of the past.
---

<p>Music, particularly live music, has been central in my life since my teens. Punk shows 
at the Cuban Club and hair bands at Lakeland Civic Center. In the nearly 40 years since, I'd guess I've seen 500 live shows give or take a dozen.</p>
<p>This section will focus on what I'm listening to now as well as tales of shows from the past.</p>

<h3>Recently Played</h3>
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
  <li class="recently-played__track">
   <a href="{{ track.url }}" class="track__url"> 
      <div class="track__media"> 
        <img src="{{ track.image[2]['#text'] }}" alt="Album artwork for {{ track.name }} by {{ track.artist['#text'] }}" loading="lazy" />
      </div> 
      <span class="track__name">{{ track.name }}</span> 
      <span class="track__artist">{{ track.artist['#text'] }}</span> 
    </a> 
  </li> 
  {% endfor %}
  </ul>
