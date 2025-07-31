const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { ApifyClient } = require("apify-client");
const {
  getActors,
  getInputSchema,
  runActorAndGetResult,
} = require("./apifyService");

app.use(cors());
app.use(express.json());
app.post("/api/actors", async (req, res) => {
  const { apiKey } = req.body;

  try {
    const client = new ApifyClient({ token: apiKey });
    const { items } = await client.actors().list(); 

    const detailedActors = await Promise.all(
      items.map(async (actor) => {
        try {
          const fullActor = await client.actor(actor.id).get();
          return fullActor;
        } catch (e) {
          return actor;
        }
      })
    );

    res.json({ success: true, actors: detailedActors });
  } catch (err) {
    console.error("Error fetching actors:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/api/schema", async (req, res) => {
  const { apiKey, actorId } = req.body;

  try {
    const apifyClient = new ApifyClient({ token: apiKey });
    const actorClient = apifyClient.actor(actorId);
    const actorDetails = await actorClient.get();

    if (!actorDetails.inputSchema && actorDetails.exampleRunInput) {
      const exampleInput = actorDetails.exampleRunInput.body;
      return res.json({
        success: true,
        schema: null,
        exampleInput: JSON.parse(exampleInput),
        note: "This actor does not define an input schema. Showing example input instead.",
      });
    }

    if (!actorDetails.inputSchema) {
      return res.status(404).json({
        success: false,
        error: "Input schema not found for this actor.",
      });
    }

    res.json({ success: true, schema: actorDetails.inputSchema });
  } catch (err) {
    console.error("Apify API error:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

function normalizeUrlsInInput(input) {
  const fixedInput = { ...input };

  for (const key in fixedInput) {
    if (
      key.toLowerCase().includes("urls") &&
      Array.isArray(fixedInput[key]) &&
      typeof fixedInput[key][0] === "string"
    ) {
      fixedInput[key] = fixedInput[key].map((url) => ({ url }));
    }
  }

  return fixedInput;
}

app.post("/api/run", async (req, res) => {
  const { apiKey, actorId, input } = req.body;
  console.log("Running actor with raw input:", input);

  try {
    const normalizedInput = normalizeUrlsInInput(input);
    console.log("Normalized input:", normalizedInput);

    const apifyClient = new ApifyClient({ token: apiKey });
    const actorClient = apifyClient.actor(actorId);

    const run = await actorClient.call(normalizedInput, { waitSecs: 60 });
    console.log(run);
    res.json({ success: true, runId: run.id, status: run.status });
  } catch (err) {
    console.error("Apify run error:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});


let apifyClientInstance = null;

const initializeApifyClient = (req, res, next) => {
  const { apiKey } = req.body; 
  if (!apiKey) {
    return res
      .status(400)
      .json({ error: "Apify API key is required in the request body." });
  }

  try {
    apifyClientInstance = new ApifyClient({ token: apiKey });
    next(); 
  } catch (error) {
    console.error("Failed to initialize ApifyClient:", error);
    return res.status(500).json({
      error: "Failed to initialize Apify client with provided API key.",
      details: error.message,
    });
  }
};


app.post(
  "/api/actors/by-name/:authorName/:actorName/build-id",
  initializeApifyClient,
  async (req, res) => {
    const { authorName, actorName } = req.params;
    const fullActorName = `${authorName}~${actorName}`;

    try {
      const actor = await apifyClientInstance.actor(fullActorName).get();

      if (!actor) {
        return res
          .status(404)
          .json({ error: `Actor '${fullActorName}' not found.` });
      }
      const latestBuild = actor.taggedBuilds?.latest;

      if (!latestBuild || !latestBuild.buildId) {
        return res.status(404).json({
          error: `No 'latest' build found for actor '${fullActorName}'.`,
        });
      }

      res.json({
        actorId: actor.id,
        actorName: actor.name,
        latestBuildId: latestBuild.buildId,
        latestBuildVersion: latestBuild.version,
      });
    } catch (error) {
      console.error(
        `Error fetching build ID for actor ${fullActorName}:`,
        error
      );
      if (error.statusCode === 401) {
        res.status(401).json({
          error: "Authentication failed. Invalid Apify API key.",
          details: error.message,
        });
      } else if (error.statusCode === 404) {
        res.status(404).json({
          error: `Actor '${fullActorName}' not found or inaccessible.`,
          details: error.message,
        });
      } else {
        res.status(500).json({
          error: "Failed to retrieve actor build ID.",
          details: error.message,
        });
      }
    }
  }
);


app.post(
  "/api/actor-builds/:buildId/schema",
  initializeApifyClient,
  async (req, res) => {
    const { buildId } = req.params;

    try {
      const build = await apifyClientInstance.build(buildId).get();

      if (!build) {
        return res
          .status(404)
          .json({ error: `Actor build with ID '${buildId}' not found.` });
      }
      const inputSchema = build.inputSchema;

      if (!inputSchema) {
        return res.status(404).json({
          error: `Input schema not found for build ID '${buildId}'. This actor build might not have a defined input schema.`,
        });
      }
      const parsedSchema = typeof inputSchema === 'string'
  ? JSON.parse(inputSchema)
  : inputSchema;

console.log("Input schema properties:", parsedSchema.properties);
      res.json(parsedSchema); 
    } catch (error) {
      console.error(
        `Error fetching input schema for build ID ${buildId}:`,
        error
      );
      if (error.statusCode === 401) {
        res.status(401).json({
          error: "Authentication failed. Invalid Apify API key.",
          details: error.message,
        });
      } else if (error.statusCode === 404) {
        res.status(404).json({
          error: `Actor build '${buildId}' not found or inaccessible.`,
          details: error.message,
        });
      } else {
        res.status(500).json({
          error: "Failed to retrieve actor input schema.",
          details: error.message,
        });
      }
    }
  }
);



// app.post("api/run", async (req, res) => {
//   const { actorId, input, apiKey } = req.body;

//   if (!actorId || !apiKey) {
//     return res.status(400).json({ error: "Missing actorId or apiKey" });
//   }

//   const client = new ApifyClient({ token: apiKey });

//   try {
//     // Run the actor with input
//     const run = await client.actor(actorId).call(input);

//     // Get dataset items (results)
//     const { items } = await client.dataset(run.defaultDatasetId).listItems();

//     res.json({ runId: run.id, items });
//   } catch (error) {
//     console.error("Actor run failed:", error);
//     res.status(500).json({ error: "Actor run failed", details: error.message });
//   }
// });

app.listen(port, () => {
  console.log(`✅ Apify backend listening on port ${port}`);
});
