import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { timerStart, timerEnd } from './time.js';
import { getFromCache, addToCache } from './cache.js';

dotenv.config();

export const router = express.Router();

// TODO útfæra proxy virkni
const {
  EARTHQUAKE_API_URL: earthquake_api_url,
} = process.env;

async function getEarthquakes(req, res) {
  const startTime = timerStart();
  const { type, period } = req.query;
  let data;
  try {
    data = await getFromCache(type, period);
  } catch(err) {
    console.error(err);
  }
  let cached = true;
  if (!data) {
    cached = false;
    const url = new URL( `${type}_${period}.geojson`, earthquake_api_url).href;
    console.log(url);
    const response = await fetch(url);
    data = await response.json();
    try {
      await addToCache(type, period, data);
    } catch(err) {
      console.error(err);
    }
  } else {
    data = JSON.parse(data);
  }
  const elapsed = timerEnd(startTime);
  res.json({data, info: { cached, elapsed }});
}

router.get('/', getEarthquakes);