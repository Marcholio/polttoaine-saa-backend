import fetch from "node-fetch";

import { DBStation, DBStationWithLoc } from "../types";

type GeocodingAPIResponse = {
  results: {
    address_components: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    types: string[];
  }[];
};

export const addLocation = async (
  station: DBStation
): Promise<DBStationWithLoc | null> => {
  console.log(`Fetching location for ${station.name}`);
  const stationAddress = encodeURI(station.name);
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${stationAddress}&key=${process.env.GEOCODING_API_KEY}`
  );

  const body: GeocodingAPIResponse = await res.json();

  if (body.results.length === 0) {
    console.error(`No results found for ${station.name}`);
    return null;
  }

  const location = body.results[0].geometry.location;

  return { ...station, lon: location.lng, lat: location.lat };
};
