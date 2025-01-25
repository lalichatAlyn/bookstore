import express from "express";
import { client } from "./utils/db.js";
import booksRouter from "./apps/books.js";
import cartRouter from "./apps/cart.js";

async function init() {
  const app = express();
  const port = 4000;

  await client.connect();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/books", booksRouter);
  app.use("/carts" ,cartRouter);

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

init();