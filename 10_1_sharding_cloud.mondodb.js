// ☁️ MongoDB Atlas and Sharding — The Easy Way

// When you use MongoDB Atlas (the official managed cloud platform),
// MongoDB takes care of all the complex setup — config servers, replica sets, routers, balancers — for you.

// So you don’t need to manually run:

// mongod --configsvr

// mongod --shardsvr

// mongos

// Atlas handles all that automatically.

// Your job?
// 👉 Just enable sharding and pick a shard key for your collection.

// 🧠 1. What Atlas Does for You Automatically

// When you deploy a “Cluster Tier M30 or higher” in MongoDB Atlas:

// It already runs as a sharded cluster.

// Each shard is a replica set.

// The balancer runs automatically.

// The mongos router is built-in to the cluster endpoint.

// 💡 So, you get:
// ✅ Fault tolerance
// ✅ Horizontal scaling
// ✅ Global data distribution
// ✅ Auto-balancing

// without touching any manual config or terminal command.

// 2. Prerequisite — Create an Atlas Cluster

// Go to: https://cloud.mongodb.com

// Create a Project (if not already)

// Click “Build a Database”

// Choose:

// Deployment Type: Dedicated Cluster

// Tier: M30 or higher (Free M0 clusters are not sharded)

// Choose your cloud provider (AWS / GCP / Azure)

// Deploy it 🚀

// Once deployed, this cluster already supports sharding.

// 🧩 3. Connect to Atlas (Shell or App)

// After your cluster is ready:

// Click “Connect” → “Connect using MongoDB Shell”

// Copy the connection string (something like 👇):

// mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net" --username bhargav

// Paste in your terminal → enter password → you’re in.

// 🧩 4. Enable Sharding for Your Database

// Once connected:

use("ecommerce");
sh.enableSharding("ecommerce");
// ✅ This tells MongoDB Atlas to shard data for this database.

// 🧩 5. Shard a Collection

// Now, pick your shard key and run:

sh.shardCollection("ecommerce.orders", { customerId: 1 });

// ✅ Done — your collection is now distributed automatically across shards.

// Atlas will take care of:

// Creating chunks

// Assigning data to shards

// Balancing automatically in background

// 🧩 6. Insert Data (to See It Working)

for (let i = 1; i <= 5000; i++) {
   db.orders.insertOne({
      orderId: i,
      customerId: Math.floor(Math.random() * 1000),
      total: Math.floor(Math.random() * 5000),
   });
}


// Then check shard distribution:

db.orders.getShardDistribution();

// Shard shard-rs0: 51% data
// Shard shard-rs1: 49% data
// Totals:
//     Documents: 5000
//     Data: 1.2MB

// 🎯 You can see data split almost evenly between shards — automatically!


// 7. Verify Sharding Status

// Check cluster sharding overview:

sh.status();

// sharding version: ...
// shards:
//   { "_id" : "atlas-shard-0", "host" : "atlas-shard-0/..." }
//   { "_id" : "atlas-shard-1", "host" : "atlas-shard-1/..." }

// databases:
//   { "_id" : "ecommerce", "primary" : "atlas-shard-0", "partitioned" : true }
//   ecommerce.orders
//     shard key: { "customerId" : 1 }
//     chunks:
//         atlas-shard-0  4
//         atlas-shard-1  3

// 8. Hashed Shard Key (Optional for Auto Distribution)

// If your key values aren’t evenly distributed (like _id),
// you can use hashed sharding:

sh.shardCollection("ecommerce.orders", { customerId: "hashed" });

// 9. Performance Tuning in Atlas (Bonus)

// Atlas provides visual monitoring for:

// Query latency

// Index usage

// Balancer activity

// Chunk migrations

// Go to:
// ➡️ Atlas → Cluster → Metrics
// and you’ll see live graphs showing shard utilization and balancing in real time.

// It’s super useful for debugging sharding issues.

// 🧩 10. No Manual Maintenance Required

// Atlas automatically:

// Monitors chunk distribution

// Rebalances shards when needed

// Handles node failures

// Scales storage and compute on-demand

// If you add new shards (via Cluster Scaling → “Add Shard”),
// Atlas automatically redistributes your existing data.

// ⚡ Key Differences: Local vs. Cloud
// Feature	Local Setup	Atlas Cloud
// Setup	Manual (config servers, mongos, etc.)	Fully managed
// Shard Addition	Manual addShard()	Auto-managed
// Balancer	Manual control	Automatic
// Monitoring	Command-line only	Beautiful UI dashboard
// Scaling	Add servers manually	1-click scaling
// Recommended for	Learning / Testing	Real-world production
// 🧠 Summary Steps (in Atlas)

// 1️⃣ Connect to Atlas using mongosh
// 2️⃣ use("ecommerce")
// 3️⃣ sh.enableSharding("ecommerce")
// 4️⃣ sh.shardCollection("ecommerce.orders", { customerId: "hashed" })
// 5️⃣ Insert data
// 6️⃣ Check with sh.status() and db.orders.getShardDistribution()

// ✅ You now have a fully distributed, auto-managed, production-grade sharded cluster.