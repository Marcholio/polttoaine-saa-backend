import { DBStationWithLoc, Station } from "./types";

export const convertDBStationWithLocation = (
  station: DBStationWithLoc
): Station => ({
  id: station.id,
  name: station.name,
  coordinates: [station.lon, station.lat],
  prices: {
    Ysi5: station.Ysi5,
    Ysi8: station.Ysi8,
    Diesel: station.Diesel,
  },
});
