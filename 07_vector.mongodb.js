import OpenAI from "openai";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();

const collection = client.db("test").collection("articles");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Step 1: Get query embedding
const query = "How to perform semantic search in MongoDB?";

const embeddingRes = await openai.embeddings.create({
   model: "text-embedding-3-small",
   input: query,
});

const queryVector = embeddingRes.data[0].embedding;

collection.insertOne({ title: "How to perform semantic search in MongoDB?", category: "database", queryVector });

// Step 2: Run vector search
const results = await collection
   .aggregate([
      {
         $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector,
            numCandidates: 10,
            limit: 3,
         },
      },
      {
         $project: {
            title: 1,
            score: { $meta: "vectorSearchScore" },
         },
      },
   ])
   .toArray();

console.log("Results:", results);

await client.close();

//OP
// [
//   {
//     title: "MongoDB Vector Search Guide",
//     score: 0.97
//   },
//   {
//     title: "Introduction to Semantic Search",
//     score: 0.83
//   },
//   {
//     title: "How to Build an AI Search Engine",
//     score: 0.79
//   }
// ]
