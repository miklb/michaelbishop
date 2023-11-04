---
layout: layouts/default.html
title: Listening
permalink: "listening.html"
pagination:
  data: lastfm.recenttracks.track
  size: 10
eleventyNavigation:
  key: Listening
  order: 4
meta:
  title: Listening
  desc: What I'm listening to and tales of shows of the past.
---
<h2>{{ title }}</h2>
<p>Music, particularly live music, has been central in my life since my teens. Punk shows 
at the Cuban Club and hair bands at Lakeland Civic Center. In the nearly 40 years since, I'd guess I've seen 500 live shows give or take a dozen.</p>
<p>This section will focus on what I'm listening to now as well as tales of shows from the past.</p>

<h3>Recently Played</h3>
<ul class="recently-played"> 
  {% for item in pagination.items %} 
  <li class="recently-played__track">
   <a href="{{ item.url }}" class="track__url"> 
      <div class="track__media"> 
        <img src="{{ item.image[2]['#text'] }}" alt="Album artwork for {{ item.name }} by {{ item.artist['#text'] }}" loading="lazy" />
      </div> 
      <span class="track__name">{{ item.name }}</span> 
      <span class="track__artist">{{ item.artist['#text'] }}</span> 
    </a> 
  </li> 
  {% endfor %}
  </ul>