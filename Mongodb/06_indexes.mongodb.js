use("ecommerce");

// db.sales.find()

// db.sales.createIndex({quantity: 1})
db.sales.getIndexes();

//output

// [
//   {
//     v: 2,
//     key: { _id: 1 },
//     name: "_id_"
//   },
//   {
//     v: 2,
//     key: { quantity: 1 },
//     name: "quantity_1" <--- Here we are droping this index
//   }
// ]


/// If you want to update index, we cant directly update index, but instead we can drop the index and create a new one

db.sales.dropIndex("quantity_1"); /// Using name or key pattern, we can get through getIndexes() method

//or

db.sales.dropIndex({ quantity: 1 });

db.sales.createIndex({ quantity: 1 }, { unique: true });
db.sales.createIndex({ customerId: 1, date: -1 }, { unique: true });
db.sales.getIndexes();


// Drop All Indexes, If you want to drop every index (except the _id index),
db.sales.dropIndexes();


// /To see how often an index is used:
db.sales.aggregate([{ $indexStats: {} }]);
// //op
// [
//   { name: "_id_", accesses: { ops: 25, since: "2025-11-10T00:00:00Z" } },
//   { name: "quantity_1", accesses: { ops: 120, since: "2025-11-10T00:00:00Z" } }
// ]
