import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DynamicForm from "@/components/ui/dynamicform";
import { Star, Users } from "lucide-react";
import axios from "axios";

type Actor = {
  id: string;
  name: string;
  username: string;
  title: string;
  description?: string;
  pictureUrl?: string;
  stats?: { totalUsers?: number };
};

type ActorListResponse = {
  success: boolean;
  actors: Actor[];
};

type BuildIdResponse = {
  actorId: string;
  latestBuildId: string;
};

type SchemaResponse = {
  input?: any;
  properties?: any;
};

type RunActorResponse = {
  runId: string;
};

const Home: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [runLink, setRunLink] = useState("");
  const [actorId, setActorId] = useState("");

  const fetchActors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post<ActorListResponse>("http://localhost:3000/api/actors", {
        apiKey,
      });

      if (res.data.success) {
        setActors(res.data.actors);
      } else {
        setError("Failed to fetch actors");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleActorClick = async (actor: Actor) => {
    setError("");
    try {
      const buildRes = await axios.post<BuildIdResponse>(
        `http://localhost:3000/api/actors/by-name/${actor.username}/${actor.name}/build-id`,
        { apiKey }
      );

      const buildId = buildRes.data.latestBuildId;
      setActorId(`${actor.username}~${actor.name}`);

      const schemaRes = await axios.post<SchemaResponse>(
        `http://localhost:3000/api/actor-builds/${buildId}/schema`,
        { apiKey }
      );

      const schemaData = schemaRes.data;
      const finalSchema = schemaData.input || schemaData.properties;

      if (!finalSchema) throw new Error("No valid input schema found.");

      setSelectedSchema(finalSchema);
      setFormData({});
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch schema");
    }
  };

  const handleRunActor = async () => {
    try {
      const res = await axios.post<RunActorResponse>("http://localhost:3000/api/run", {
        apiKey,
        actorId,
        input: formData,
      });

      const runId = res.data.runId;

      if (runId) {
        const consoleLink = `https://console.apify.com/view/runs/${runId}`;
        setRunLink(consoleLink);
        window.open(consoleLink, "_blank");
      } else {
        alert("Actor run started, but run ID is missing.");
      }
    } catch (err) {
      console.error("Failed to run actor:", err);
      alert("Error running actor. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-4">
            No setup, no clutter — Run Apify Actors Instantly
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Enter your API key, explore your actors, and run one in real-time.
          </p>

          <div className="flex max-w-2xl mx-auto gap-2">
            <Input
              type="text"
              placeholder="Your Apify API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="h-14 pl-4 pr-4 text-lg border-gray-200 rounded-full"
            />
            <Button
              onClick={fetchActors}
              className="h-14 px-6 text-white bg-gray-800 hover:bg-gray-900 rounded-full"
            >
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {actors.map((actor, index) => (
            <Card
              key={index}
              className="border hover:shadow-md transition cursor-pointer"
              onClick={() => handleActorClick(actor)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={
                      actor.pictureUrl ||
                      `https://ui-avatars.com/api/?name=${actor.title}`
                    }
                    alt={actor.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {actor.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {actor.username}/{actor.name}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  {actor.description || "No description available."}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{actor.stats?.totalUsers || 0} users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{(Math.random() * 5).toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedSchema && (
          <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">🎯 Input Schema</h2>
            <DynamicForm
              schema={selectedSchema}
              formData={formData}
              setFormData={setFormData}
            />
            <Button onClick={handleRunActor} className="mt-6">
              Run Actor
            </Button>

            {runLink && (
              <div className="mt-4 text-sm text-blue-600">
                <span>📎 Apify Console:</span>{" "}
                <a
                  href={runLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {runLink}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
