// Performance Optimization in MongoDB?
// Performance optimization means making your MongoDB queries faster, resource-efficient, and scalable,
// so your app performs well even with millions of records.

// It involves improving:
// ⚡ Query speed
// 💾 Index usage
// 🧮 Aggregation efficiency
// 🔄 Write operations
// 🧱 Schema design
// ⚙️ Hardware and configuration

//Analyze Query Performance Using .explain()
// Before optimizing, always measure.

db.sales.find({ customerId: 123 }).explain("executionStats");

// output

// {
//   "executionStats": {
//     "executionTimeMillis": 8,
//     "nReturned": 1,
//     "totalDocsExamined": 1,
//     "totalKeysExamined": 1
//   }
// }

// 2. Index Optimization (Query Acceleration)

// You already know how to create indexes — now let’s use them strategically.

// ✅ Index Fields That Are:

// Frequently used in filters (find, $match)

// Frequently used in sorting ($sort)

// Used for join lookups ($lookup with foreignField)

// Have high selectivity (e.g., email, not gender)

db.orders.createIndex({ customerId: 1 });
db.orders.createIndex({ status: 1, date: -1 });

// Compound Index (multiple fields), Instead of separate indexes:
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ date: -1 });

// Better
db.orders.createIndex({ status: 1, date: -1 });

//MongoDB can now use this one index for queries like:

db.orders.find({ status: "pending" }).sort({ date: -1 });

// 3. Aggregation Optimization

// Aggregation is a powerful tool for data analysis and transformation.

// Use $project early - Only keep required fields early in the pipeline

[
   { $match: { status: "completed" } },
   { $project: { _id: 0, customerId: 1, total: 1 } },
   { $group: { _id: "$customerId", totalSpent: { $sum: "$total" } } },
];

// ✅ Reduces data load through the pipeline.

// Use $match early

// Filters early → fewer documents to process:

[
   { $match: { date: { $gte: ISODate("2025-01-01") } } }, // early filter
   { $group: { _id: "$category", total: { $sum: "$sales" } } },
];

// Avoid $lookup unless necessary

// If you need $lookup, index both the localField and foreignField.

// Example:

db.orders.createIndex({ customerId: 1 });
db.customers.createIndex({ _id: 1 });

// Write Optimization
// Issue - Optimization
// High write latency	=> Use bulk writes
// Too frequent updates =>	Use $inc, $set instead of rewriting full doc
// Frequent inserts => 	Use writeConcern: 0 if safe
// Heavy concurrent writes	=> Use sharding by high-cardinality key

db.sales.bulkWrite([{ insertOne: { document: { item: "A", qty: 10 } } }, { insertOne: { document: { item: "B", qty: 20 } } }]);

// Use $inc, $set instead of rewriting full doc
db.sales.updateOne({ _id: 1 }, { $inc: { quantity: 1 } });

// Use writeConcern: 0 if safe
db.sales.updateOne({ _id: 1 }, { $set: { quantity: 1 } }, { writeConcern: { w: "0" } });

// Use bulk writes
db.sales.bulkWrite([{ insertOne: { document: { item: "A", qty: 10 } } }, { insertOne: { document: { item: "B", qty: 20 } } }]);

// Sharding by high-cardinality key
db.sales.createIndex({ item: 1 });

//⚡ 6. Pagination Optimization

// Use limit and skip for pagination
db.sales.find().limit(10).skip(20);

// ✅ Use range-based pagination instead:

db.products.find({ _id: { $gt: lastId } }).limit(10); // This uses an index on _id, much faster!

// 📊 7. Use Projections to Return Only Needed Fields - Don’t fetch entire documents if you need only specific fields.

db.users.find({}, { name: 1, email: 1 });

// 8. Caching Layer
// If your data doesn’t change often (e.g., product lists),
// you can use Redis or in-memory caching to reduce database hits.

if (cache.has("topProducts")) return cache.get("topProducts");
const products = await db.products.find({ rating: { $gt: 4.5 } }).toArray();
cache.set("topProducts", products);

// 9. Sharding (Scale Horizontally)
// When your data becomes huge (e.g., 100M+ docs),
// you can split data across multiple machines.

sh.enableSharding("ecommerce");
sh.shardCollection("ecommerce.orders", { customerId: 1 });

// ✅ Each shard stores a portion of data.
// ✅ Increases read/write throughput.

// 10. Analyze Index Usage

db.collection.aggregate([{ $indexStats: {} }]);
