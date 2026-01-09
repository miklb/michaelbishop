import EleventyFetch from "@11ty/eleventy-fetch";
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.WEBMENTION_IO_TOKEN;

// Cache for Bluesky profile lookups
const bskyProfileCache = new Map();

async function fetchBlueskyProfile(did) {
    if (bskyProfileCache.has(did)) {
        return bskyProfileCache.get(did);
    }
    
    try {
        const url = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`;
        const profile = await EleventyFetch(url, {
            duration: "1d", // Cache for 1 day
            type: "json"
        });
        
        const result = {
            type: "card",
            name: profile.displayName || profile.handle,
            url: `https://bsky.app/profile/${profile.handle}`,
            photo: profile.avatar || ""
        };
        
        bskyProfileCache.set(did, result);
        return result;
    } catch (e) {
        console.log(`[Webmentions] Could not fetch Bluesky profile for ${did}`);
        return null;
    }
}

function extractBlueskyDid(url) {
    // Match did:plc:... in URL
    const match = url?.match(/did:plc:[a-z0-9]+/);
    return match ? match[0] : null;
}

export default async function() {
    // Use JF2 format
    const url = `https://webmention.io/api/mentions.jf2?token=${API_KEY}&domain=michaelbishop.me&per-page=1000`;

    const data = await EleventyFetch(url, {
        duration: "1h",
        type: "json"
    });
    
    // Enrich entries missing author data with Bluesky profile lookup
    const enrichedChildren = await Promise.all(data.children.map(async (entry) => {
        // If no author data, try to fetch from Bluesky
        if (!entry.author || !entry.author.name) {
            const did = extractBlueskyDid(entry.url) || extractBlueskyDid(entry['wm-source']);
            if (did) {
                const bskyProfile = await fetchBlueskyProfile(did);
                if (bskyProfile) {
                    entry.author = bskyProfile;
                }
            }
        }
        return entry;
    }));
    
    return {
        ...data,
        children: enrichedChildren
    };
};