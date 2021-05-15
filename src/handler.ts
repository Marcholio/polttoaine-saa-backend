import dynamo from "./dynamodb";
import { addLocation } from "./integrations/locations";
import { getPrices } from "./integrations/prices";

import { DBStationWithLoc, Station } from "./types";

const convertDBStationWithLocation = (station: DBStationWithLoc): Station => ({
  id: station.id,
  name: station.name,
  coordinates: [station.lon, station.lat],
  prices: {
    Ysi5: station.Ysi5,
    Ysi8: station.Ysi8,
    Diesel: station.Diesel,
  },
});

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

  const newStations = newData.filter(
    (station) => !existingStationIds.includes(station.id)
  );

  const newStationsWithLoc: DBStationWithLoc[] = [];

  for (let i = 0; i < newStations.length; i++) {
    const station = newStations[i];
    const stationWithLoc = await addLocation(station);
    if (stationWithLoc) {
      newStationsWithLoc.push(stationWithLoc);
    }
  }

  const updatedStations = existingStations.map((station) => {
    const updated = newData.find((u) => u.id === station.id);

    // Replace previous price data with new data
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

  await dynamo.updateStations(newStationsWithLoc.concat(updatedStations));

  return "OK";
};
