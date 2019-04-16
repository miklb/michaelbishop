---
id: 264
title: Apple Drivers in VMware Fusion
date: 2008-04-26T00:00:00-04:00
author: Michael Bishop
layout: post
guid: https://miklb.com/apple-drivers-in-vmware-fusion
permalink: /blog/2008/04/26/apple-drivers-in-vmware-fusion/
tags:
  - aside
  - bluetooth
  - leopard
  - Mac
  - vmware-fusion
kind:
  - Note
---
<p>I think with the help of a google search and <a href="http://blog.gruby.com/2007/12/14/bluetooth-in-vmware-fusion/">Scott Gruby</a>, I’ve figured out how to use my bluetooth keyboard in VM.</p>
<blockquote>Finally, I found a reference to inserting the Leopard DVD while in Windows. I tried this and when I did, the BootCamp driver installer came up and installed my drivers. Perfect; why couldn’t VMWare say something about this on their website?</blockquote>

<p>Thanks Scott and I agree, why isn’t this documented somewhere.</p>

<p><em>Edit 8/1/08</em>Seems you also have to disconnect the USB Bluetooth Host Controller to get it to work.  Something about only one OS can control the device at a time, so the machine gets confused when the two are both connected.  Disconnecting the controller, shutting down the XP install, then restarting VMware Fusion finally got it working.</p>