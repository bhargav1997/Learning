use("ecommerce");

const session = db.getMongo().startSession();

session.startTransaction();

try {
   db.accounts.updateOne({ _id: 1 }, { $inc: { balance: -100 } }); // $inc to Increment from current Transcation    
   db.accounts.updateOne({ _id: 2 }, { $inc: { balance: +100 } });
   await session.commitTransaction();
} catch (err) {
   await session.abortTransaction();
}

// db.products.insertOne({ name: "Wireless Mouse" });
// db.products.updateOne({ name: "Wireless Mouse" }, { $set: { price: 899 } });

// session.commitTransaction();

// session.abortTransaction();