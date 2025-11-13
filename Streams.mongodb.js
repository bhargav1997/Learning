//Let’s go step-by-step — from the concept to a complete working example (Node.js + MongoDB).

// What Are Change Streams?

// Change Streams let your application listen for changes in real time — without constant polling or refreshing.
// When something happens in your database (like a new insert, update, or delete), MongoDB immediately emits an event that your code can respond to.

// 👉 Works on:
// A single collection
// A database (all collections)
// Or even a whole cluster

// ✅ Supported only on Replica Sets or MongoDB Atlas (cloud)

//Use Cases - Real Time Dashboards, ChatApps, Notifications, Background Jobs, Analytics

// /If you’re using MongoDB locally, you must enable replica set mode.

// In Terminal, run: mongod --dbpath /data/db --replSet rs0

//Then, in the mongosh shell run: rs.initiate();

// ✅ Now your local MongoDB can use change streams.

// Watch a Collection in MongoDB Shell

let changeStream = db.orders.watch();

while (changeStream.hasNext()) {
   printjson(changeStream.next());
}

// Now in another terminal, insert or update something:
db.orders.insertOne({ customer: "Bhargav", total: 500 });

// Output in Change stream,

// {
//   "_id": { "_data": "..." },
//   "operationType": "insert",
//   "ns": { "db": "ecommerce", "coll": "orders" },
//   "documentKey": { "_id": ObjectId("...") },
//   "fullDocument": {
//     "_id": ObjectId("..."),
//     "customer": "Bhargav",
//     "total": 500
//   }
// }

// 💻 3. Node.js Full Example — Real-Time Listener

// Step 1: Setup your project

// mkdir mongo-change-stream-demo
// cd mongo-change-stream-demo
// npm init -y
// npm install mongodb dotenv

// Step 2: Create a .env file

// MONGO_URI=mongodb://127.0.0.1:27017/ecommerce

// Step 3: Create a listener.js file

import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
   await client.connect();
   console.log("✅ Connected to MongoDB...");

   const db = client.db("ecommerce");
   const collection = db.collection("orders");

   console.log("👀 Listening for changes in 'orders' collection...");

   // Start watching the collection
   const changeStream = collection.watch();

   changeStream.on("change", (change) => {
      console.log("🔄 Change detected:");

      switch (change.operationType) {
         case "insert":
            console.log(`🟢 New Order Added:`, change.fullDocument);
            break;
         case "update":
            console.log(`🟡 Order Updated:`, change.updateDescription.updatedFields);
            break;
         case "delete":
            console.log(`🔴 Order Deleted:`, change.documentKey);
            break;
         default:
            console.log("Other Change:", change);
      }
   });
}

run().catch(console.error);

// Step 4: Run the listener.js file

// node listener.js

//✅ Connected to MongoDB...
// 👀 Listening for changes in 'orders' collection...

use("ecommerce");
db.orders.insertOne({ customer: "Bhargav", total: 250 });

// op
// 🔄 Change detected:
// 🟢 New Order Added: { _id: ObjectId("..."), customer: 'Bhargav', total: 250 }

// 4. Watching the Whole Database

// Instead of one collection, you can watch all collections in a database:

// const changeStream = db.watch();

// Or for the entire cluster (all DBs):
// const changeStream = client.watch();

// Watch Specific Operations (Filter)

let changeStream2 = collection.watch([{ $match: { operationType: { $in: ["insert", "update"] } } }]);

// /Real Use Case Example — Send Notification
//You can easily trigger backend actions when changes happen:
changeStream2.on("change", (change) => {
   if (change.operationType === "insert") {
      const order = change.fullDocument;
      sendEmail(order.customer, `Your order of ₹${order.total} has been received!`);
   }
});

//Bonus — Use with WebSocket (for live UI updates)

//You can even combine it with Socket.io to broadcast updates to connected clients.

import { Server } from "socket.io";
const io = new Server(3000);

changeStream.on("change", (change) => {
   io.emit("dbChange", change);
});

//Then your frontend (React or HTML page) listens for updates:'

socket.on("dbChange", (data) => {
   console.log("Realtime update:", data);
});
