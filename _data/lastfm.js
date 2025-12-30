import Fetch from "@11ty/eleventy-fetch";
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.LFM_API_KEY;

export default async function () {
    if (!API_KEY) {
        console.log('[LastFM] No API key found, skipping');
        return { recenttracks: { track: [] } };
    }
    
    let url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=miklb&api_key=${API_KEY}&limit=20&format=json`;

    try {
        let json = await Fetch(url, {
            duration: "1h",
            type: "json"
        });
        return json;
    } catch (error) {
        console.log('[LastFM] Fetch failed:', error.message);
        // Return empty data structure so build doesn't fail
        return { recenttracks: { track: [] } };
    }
};