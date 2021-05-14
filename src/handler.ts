export const getStations = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        station: "Auroranportti Kylänportti 16",
        coordinates: [24.700475, 60.240725],
        prices: {
          "95": 1.62,
          "98": 1.71,
          Diesel: 1.44,
        },
      },
      {
        station: "Bemböle Bellinmäki 2",
        coordinates: [24.67247, 60.22291],
        prices: {
          "95": 1.62,
          "98": 1.75,
          Diesel: 1.44,
        },
      },
    ]),
  };
};
