import { getAllStations } from "./stationsService";
import fs from "fs";

describe("integration test", () => {
  it("Returns an array that is not empty", async () => {
    const stations = await getAllStations();
    fs.writeFileSync("out/allStationsTest.json", JSON.stringify(stations));
    expect(stations.length).toBeGreaterThan(0);
  }, 30000);
});
