---
id: 155
title: Use Pythonista to Get Weather of Current Location into Drafts App
date: 2014-01-10T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/use-pythonista-to-get-weather-of-current-location-into-drafts-app
permalink: /blog/2014/01/10/use-pythonista-to-get-weather-of-current-location-into-drafts-app/
tags:
  - drafts-app
  - forecastio
  - python-1
  - pythonista
  - weather
kind:
  - Note
---
<p>My quest began when I began using Drafts app (among many other ways) to keep a fishing log. I created a TextExpander fill-in snippet to quickly enter what (if anything) was caught, the date, the type of lure(s) used, etc. I really wanted to automate adding the weather conditions as well, but alas, my search for that solution turned up nothing…until yesterday.</p>

<p>It started when <a href="https://twitter.com/drdrang">@drdrang</a> shared a <a href="http://omz-software.com/pythonista/">Pythonista</a> script to <a href="http://www.leancrew.com/all-this/2014/01/location-and-leverage/">leverage the location inside iOS</a>. Later he shared <a href="https://gist.github.com/hiilppp/8268816">another version</a>, from <a href="https://twitter.com/hiilppp">@hiilppp</a>.</p>

<p>Armed with that knowledge and a rudimentary knowledge of the <a href="https://developer.forecast.io">forecast.io API</a>, I set off to <strike>steal</strike> crib some Python usage of their API. Enter  <a href="https://twitter.com/jayhickey">@jayhickey</a> and his <a href="https://github.com/jayhickey/Pythonista-Scripts/blob/master/PySky.py">PySky</a> script. While written for the v1 Dark Skies API, it gave me enough Python to convert to the new v2 of Forecast.io.</p>

<p>The result?</p>

<script src="https://gist.github.com/miklb/8346411.js"></script>

<p><a href="https://gist.github.com/miklb/8346411">original gist</a></p>

<p>This version simply grabs the current weather summary and temperature from your current location, meant to be used with <a href="https://twitter.com/draftsapp">@draftsapp</a> as a URL action <code class="highlighter-rouge">pythonista : / / py_forecast?action=run&argv=[[draft]]</code>. Dr. Drang suggests using <a href="https://gist.github.com/omz/4076735">New From Gist</a>, however I had better success using <a href="http://ioctocat.com">iOctocat</a>. There is an “open in…” dialog when viewing your gists or starred gists, and pick Pythonista.</p>

<p>Certainly for my fishing log I am expanding on this to include wind, sunrise and set times as well as the recently added moon phase. I figured a more generic version would be best shared, but please do not hesitate to leave a comment or  ask me a question on Twitter <a href="https://twitter.com/miklb">@miklb</a>. I’ll do my best to help, as I’m indebted to the aforementioned gents for sharing their code and helping in the first place.</p>