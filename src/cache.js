import redis from 'redis';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config();

const {
  REDIS_URL: url,
} = process.env;

const redisOptions = {
  url,
};

const client = redis.createClient(redisOptions);

const asyncGet = util.promisify(client.get).bind(client);
const asyncSet = util.promisify(client.set).bind(client);

/**
 * Gets earthquake data from the cache if it is in the cache
 * @param {string} type Earthquake strength
 * @param {string} period Period of time when earthquakes happened
 * @returns Cached earthquake data if it is in the cache, otherwise null
 */
export async function getFromCache(type, period) {
  const key = `type:${type}-period:${period}`;
  const cached = await asyncGet(key);
  if (cached) {
    return cached;
  }
  return null;
}

/**
 * Adds earthquake data to the cache with a key
 * that relates to the type and period of the data
 * @param {string} type Earthquake strength
 * @param {string} period Period of time when earthquakes happened
 * @param {json} data JSON earthquake data
 */
export async function addToCache(type, period, data) {
  const key = `type:${type}-period:${period}`;
  await asyncSet(key, JSON.stringify(data));
}
