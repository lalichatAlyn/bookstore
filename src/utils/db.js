import { MongoClient } from "mongodb";

const conectionString = "mongodb://127.0.0.1:27017";

export const client = new MongoClient(conectionString, {
  useUnifiedTopology: true,
});

export const db = client.db("book-store");