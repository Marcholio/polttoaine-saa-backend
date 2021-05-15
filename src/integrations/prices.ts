import fetch from "node-fetch";
import { load } from "cheerio";
import { differenceInDays, parse } from "date-fns/esm";

import { DBStation } from "../types";

const getStationUrls = async (): Promise<string[]> => {
  const res = await fetch("https://bensanhinta.com/paikkakunta/espoo");

  const $ = load(await res.text());
  const linkElems = $("body > main > article > ol > li > a");

  const stationUrls: string[] = [];

  // Loop through links in main page and add all links to result array
  linkElems.each((i, link) => {
    const href = $(link).attr("href");
    if (href) {
      stationUrls.push(href);
    }
  });

  return stationUrls;
};

const getStation = async (url: string): Promise<DBStation | null> => {
  console.log("Fetching " + url);
  const res = await fetch(url);

  const $ = load(await res.text());

  const id = decodeURI(url).split("/").reverse()[0];
  const name = $("article h2").text().split(":").reverse()[0].trim();
  const updatedDate = parse(
    $("article dt").text().replace("Hinnat viimeksi (", "").replace(")", ""),
    "dd.MM.yyyy",
    new Date(0)
  );

  const prices: any = {};

  $("article ul li").each((i, elem) => {
    const fuel = $(elem).text().split(":")[0];
    const price = $(elem)
      .text()
      .split(":")[1]
      .replace(" €", "")
      .trim()
      .replace(",", ".");

    if (fuel === "95") {
      prices.Ysi5 = parseFloat(price);
    } else if (fuel === "98") {
      prices.Ysi8 = parseFloat(price);
    } else if (fuel === "Diesel") {
      prices.Diesel = parseFloat(price);
    } else {
      console.error(`Unrecognized fuel ${fuel}`);
    }
  });

  // Ignore too old data
  if (differenceInDays(new Date(), updatedDate) > 5) {
    return null;
  }

  return {
    id,
    name,
    Ysi5: prices.Ysi5,
    Ysi8: prices.Ysi8,
    Diesel: prices.Diesel,
  };
};

export const getPrices = async (): Promise<DBStation[]> => {
  const stationUrls = await getStationUrls();

  const stations: DBStation[] = [];

  // Synchronous fetch due to web page query limits on bensanhinta.com
  for (const i in stationUrls) {
    const station = await getStation(stationUrls[i]);
    if (station) {
      stations.push(station);
    }
  }

  return stations;
};
