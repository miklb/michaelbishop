import Fetch from "@11ty/eleventy-fetch";
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.LFM_API_KEY;

export default async function () {
    let  url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=miklb&api_key=${API_KEY}&limit=20&format=json`;

    let json = await Fetch(url , {
        duration: "1h", // save for 1 hour
        type: "json" // we’ll parse JSON for you
    });
    return json;
};