import dynamo from "./dynamodb";
import { addLocation } from "./integrations/locations";
import { getPrices } from "./integrations/prices";
import { convertDBStationWithLocation } from "./utils";

import { DBStationWithLoc } from "./types";

export const getStations = async () => {
  const dbStations = await dynamo.getStations();

  const stations = dbStations.map(convertDBStationWithLocation);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN,
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(stations),
  };
};

export const updatePrices = async () => {
  const newData = await getPrices();

  const existingStations = await dynamo.getStations();
  const existingStationIds = existingStations.map((station) => station.id);

  // New stations without location info
  const newStations = newData.filter(
    (station) => !existingStationIds.includes(station.id)
  );

  const newStationsWithLoc: DBStationWithLoc[] = [];

  // Add location info for new stations
  for (let i = 0; i < newStations.length; i++) {
    const station = newStations[i];

    const stationWithLoc = await addLocation(station);

    if (stationWithLoc) {
      newStationsWithLoc.push(stationWithLoc);
    }
  }

  const updatedStations = existingStations.map((station) => {
    const updated = newData.find((u) => u.id === station.id);

    // Replace previous price data with new data, if updated values are found
    if (updated) {
      return {
        ...station,
        Ysi5: updated.Ysi5,
        Ysi8: updated.Ysi8,
        Diesel: updated.Diesel,
      };
    }

    // No updates found, don't update
    return station;
  });

  // Store new and updated stations to db
  await dynamo.updateStations(newStationsWithLoc.concat(updatedStations));

  return "OK";
};
