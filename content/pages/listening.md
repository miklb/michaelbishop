---
layout: layouts/default.njk
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
{% set uniqueTracks = lastfm.recenttracks.track | uniqueByKey("name") %}
  <ul class="recently-played"> 
  {% for track in uniqueTracks %}
  {% if loop.index0 > 0 %}
  <li class="recently-played__track">
   <a href="{{ track.url }}" class="track__url"> 
      <div class="track__media">
        {% set albumArt = track.image[2]['#text'] %}
        {% set altText = "Album artwork for " + track.name + " by " + track.artist['#text'] %}
        {% image albumArt, altText, "(min-width: 30em) 150px, 100px" %}
      </div> 
      <span class="track__name">{{ track.name }}</span> 
      <span class="track__artist">{{ track.artist['#text'] }}</span> 
    </a> 
  </li> 
  {% endif %}
  {% endfor %}
  </ul>
