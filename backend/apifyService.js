const axios = require('axios');

// Base Apify URL
const BASE_URL = 'https://api.apify.com/v2';

// 1. List user actors
async function getActors(apiKey) {
  const response = await axios.get(`${BASE_URL}/acts?status=READY&limit=50`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.data.data.items.map(actor => ({
    id: actor.id,
    name: actor.name,
    title: actor.title,
  }));
}

// 2. Get actor input schema
async function getInputSchema(apiKey, actorId) {
  const response = await axios.get(`${BASE_URL}/acts/${actorId}/input-schema`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.data;
}

// 3. Run actor and get final output
async function runActorAndGetResult(apiKey, actorId, input) {
  const runResponse = await axios.post(
    `${BASE_URL}/acts/${actorId}/runs?wait=full`,
    input,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const runData = runResponse.data;

  if (runData.status !== 'SUCCEEDED') {
    throw new Error(`Actor failed with status: ${runData.status}`);
  }

  if (!runData.output) {
    throw new Error('Actor run succeeded but no output was returned.');
  }

  return runData.output;
}

module.exports = {
  getActors,
  getInputSchema,
  runActorAndGetResult,
};
