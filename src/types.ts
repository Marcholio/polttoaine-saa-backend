export type Station = {
  id: string;
  name: string;
  prices: {
    Ysi5: number;
    Ysi8: number;
    Diesel: number;
  };
  coordinates: number[];
};

export type DBStation = {
  id: string;
  name: string;
  Ysi5: number;
  Ysi8: number;
  Diesel: number;
};

export type DBStationWithLoc = DBStation & { lat: number; lon: number}
