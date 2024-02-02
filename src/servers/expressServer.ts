import express from "express";
import dotenv from "dotenv";

import { SearchNotFoundError } from "../SearchService";
import { processGetSearch, processPostSearch } from "../requestProcessor";

dotenv.config();

const app = express();
const port = 8080;

app.listen(port);
app.use(express.json());
app.use((request, response, next) => {
  console.log(`Received ${request.method} ${request.path}`);
  next();
});

console.log("Listening");
app.post("/search", async (req, res) => {
  try {
    const searchId = await processPostSearch(req.body);
    res.send({ searchId });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/search/:id", async (req, res) => {
  const searchId = req.params.id;
  try {
    const result = await processGetSearch(searchId);
    res.send(result);
    return;
  } catch (error) {
    if (error instanceof SearchNotFoundError) {
      res.status(404).send("No search found with given id");
    }
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

// TODO: Handle incomplete filters, handle malformatted filters
//possible malformattings: malformatted date, extra symbols in coordinates (like spaces), type mismatches (string instead of number for distance)
