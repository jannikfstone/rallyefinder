import { getAllRallyeStations } from "../../src/stationsService";
import fs from "fs";

describe("integration test", () => {
  it("Returns an array that is not empty", async () => {
    const stations = await getAllRallyeStations();
    fs.writeFileSync("out/allStationsTest.json", JSON.stringify(stations));
    expect(stations.length).toBeGreaterThan(0);
  }, 30000);

  it.todo("Will not call the API if stations are cached");
});
