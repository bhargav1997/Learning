// 1. What is Sharding?
// 👉 Sharding means splitting your large collection across multiple machines (shards).
// It’s MongoDB’s way of handling big data + high load by distributing data horizontally.
// Think of it like dividing a huge table into smaller parts and storing them across different servers.

// Example Analogy:

// Imagine a collection orders with 100 million documents.

// Instead of keeping all 100M in one server:

// Shard 1 stores customers A–M

// Shard 2 stores customers N–Z

// MongoDB automatically routes queries to the right shard based on your query.

// 💡 Result:
// ✅ More storage capacity
// ✅ Faster queries
// ✅ Higher write throughput

// Sharding Key (Very Important!)
// A shard key decides how data is split across shards.

// Example

// If you choose customerId as your shard key:

// Orders with similar customerId go to the same shard.

sh.shardCollection("ecommerce.orders", { customerId: 1 });

// 💡 The choice of shard key is critical —
// a bad key (like constant value) can lead to unbalanced shards.

// 3 Components of a Sharded Cluster
// Component	Role
// mongod (shard servers)	Store actual data
// mongos (query router)	Routes client queries to correct shards
// config servers	Store cluster metadata (which data is where)

// In local testing, we can simulate all 3 components on one machine.

// 🧱 4. Sharding Architecture Setup (Local Example)

// 🧩 Step 1: Create Folders for Data Storage
// mkdir -p ~/mongo-shard/shard1 ~/mongo-shard/shard2 ~/mongo-shard/configdb


// 🧩 Step 2: Start Config Server
// mongod --configsvr --replSet configReplSet --dbpath ~/mongo-shard/configdb --port 26050

// 🧩 Step 3: Start Shard Servers

// Shard 1:
// mongod --shardsvr --replSet shard1ReplSet --dbpath ~/mongo-shard/shard1 --port 27018

// Shard 2:
// mongod --shardsvr --replSet shard2ReplSet --dbpath ~/mongo-shard/shard2 --port 27019

// Step 4: Initiate Replica Sets

// Open a new terminal for Mongo Shell and connect to each one to initiate replicas.

// Config Server:

// mongosh --port 26050
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [{ _id: 0, host: "localhost:26050" }]
});


// Shard 1:

// mongosh --port 27018
rs.initiate({
  _id: "shard1ReplSet",
  members: [{ _id: 0, host: "localhost:27018" }]
});


// Shard 2:

// mongosh --port 27019

rs.initiate({
  _id: "shard2ReplSet",
  members: [{ _id: 0, host: "localhost:27019" }]
});

// 🧩 Step 5: Start mongos Router

// Open another terminal and start mongos (query router):

// mongos --configdb configReplSet/localhost:26050 --port 27017


// This will be your entry point for all client connections.

// 🧩 Step 6: Connect to mongos

// Now open the shell again:

// mongosh --port 27017

// 🧩 Step 7: Add Shards to Cluster
sh.addShard("shard1ReplSet/localhost:27018");
sh.addShard("shard2ReplSet/localhost:27019");


// ✅ Both shards are now part of your cluster.

// Check status:

sh.status();


// You’ll see something like:

// sharding version: { ... }
// shards:
//   {  "_id" : "shard1ReplSet",  "host" : "shard1ReplSet/localhost:27018" }
//   {  "_id" : "shard2ReplSet",  "host" : "shard2ReplSet/localhost:27019" }

// 🧩 Step 8: Enable Sharding for a Database
sh.enableSharding("ecommerce");


// Now your ecommerce DB supports sharding.

// 🧩 Step 9: Shard a Collection

// Let’s shard the orders collection based on customerId.

sh.shardCollection("ecommerce.orders", { customerId: 1 });


// ✅ MongoDB now distributes orders across the shards.

// 🧩 Step 10: Insert Data and See Distribution
use("ecommerce");

for (let i = 1; i <= 10000; i++) {
  db.orders.insertOne({
    orderId: i,
    customerId: Math.floor(Math.random() * 1000),
    total: Math.floor(Math.random() * 5000)
  });
}


// Now check the chunk distribution:

sh.status();


// You’ll see:

// orders
//   shard key: { "customerId" : 1 }
//   chunks:
//     shard1ReplSet  6
//     shard2ReplSet  5
//   { "customerId" : { "$minKey" : 1 } } -->> { "customerId" : 500 } on shard1ReplSet
//   { "customerId" : 500 } -->> { "customerId" : { "$maxKey" : 1 } } on shard2ReplSet



// ✅ Data split across both shards automatically.

// 🧩 Step 11: Run Queries to See Routing

// If you query with shard key:

db.orders.find({ customerId: 123 });


// ➡️ Query goes only to the shard that has customerId = 123.

// If you query without the shard key:

db.orders.find({ total: { $gt: 4000 } });


// ➡️ MongoDB will query all shards (scatter-gather) — slower.
// 💡 Always include shard key in queries for max speed.

// 🧩 Step 12: Balance Chunks Automatically

// MongoDB automatically balances data across shards.

// To check the balancer status:

sh.getBalancerState();


// Enable it manually (if off):

sh.setBalancerState(true);


// To see progress:

sh.isBalancerRunning();
