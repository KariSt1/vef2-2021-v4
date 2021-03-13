import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { timerStart, timerEnd } from './time.js';
import { getFromCache, addToCache } from './cache.js';

dotenv.config();

export const router = express.Router();

const {
  EARTHQUAKE_API_URL: earthquakeApiUrl,
} = process.env;

/**
 * Asynchronous route handler for earthquake data.
 * Gets requested earthquake data from cache if it is there,
 * otherwise it fetches it from USGS. Also takes the time
 * it took to get the data.
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {json} returns json with the earthquake data
 *                 and info about if the data was cached
 *                 and how long it took to get the data
 */
async function getEarthquakes(req, res) {
  const startTime = timerStart();
  const { type, period } = req.query;
  let data;
  try {
    data = await getFromCache(type, period);
  } catch (err) {
    console.error(err);
  }
  let cached = true;
  if (!data) {
    cached = false;
    const url = new URL(`${type}_${period}.geojson`, earthquakeApiUrl).href;
    const response = await fetch(url);
    data = await response.json();
    try {
      await addToCache(type, period, data);
    } catch (err) {
      console.error(err);
    }
  } else {
    data = JSON.parse(data);
  }
  const elapsed = timerEnd(startTime);
  res.json({ data, info: { cached, elapsed } });
}

router.get('/', getEarthquakes);
