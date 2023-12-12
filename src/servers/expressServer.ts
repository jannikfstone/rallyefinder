import express from "express";
import dotenv from "dotenv";

import { SearchNotFoundError } from "../searchService";
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
app.post("/rallyefinder/search", (req, res) => {
  const response = processPostSearch(req.body);
  res.send(response);
});

app.get("/rallyefinder/search/:id", async (req, res) => {
  const searchId = parseInt(req.params.id);
  if (Number.isNaN(searchId)) {
    res.status(400).send("Malformed id");
    return;
  }
  try {
    const result = await processGetSearch(searchId);
    res.send(result);
    return;
  } catch (error) {
    if (error instanceof SearchNotFoundError) {
      res.status(404).send("No search found with given id");
    }
  }
});

// TODO: Handle incomplete filters, handle malformatted filters
//possible malformattings: malformatted date, extra symbols in coordinates (like spaces), type mismatches (string instead of number for distance)
