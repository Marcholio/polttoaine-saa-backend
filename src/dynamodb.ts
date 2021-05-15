import { DynamoDB } from "aws-sdk";
import {
  PutItemInputAttributeMap,
  WriteRequest,
} from "aws-sdk/clients/dynamodb";

import chunk from "lodash-es/chunk";

import { Station, DBStationWithLoc } from "./types";

const dynamo = new DynamoDB.DocumentClient();

const getStations = async (): Promise<DBStationWithLoc[]> => {
  if (!process.env.STATIONS_TABLE) {
    throw new Error("Missing stations table from env variables");
  }

  const res = await dynamo
    .scan({
      TableName: process.env.STATIONS_TABLE,
      IndexName: process.env.COORDINATES_INDEX,
    })
    .promise();

  return (res.Items ? res.Items : []) as DBStationWithLoc[];
};

const updateStations = async (stations: DBStationWithLoc[]): Promise<void> => {
  if (!process.env.STATIONS_TABLE) {
    throw new Error("Missing stations table from env variables");
  }

  const putRequests: WriteRequest[] = stations.map((s) => ({
    PutRequest: { Item: s as PutItemInputAttributeMap },
  }));

  // Split request in to 25 item batches
  const chunkedRequests = chunk(putRequests, 25);

  await Promise.all(
    chunkedRequests.map((requestSet) =>
      dynamo
        .batchWrite({
          RequestItems: {
            [process.env.STATIONS_TABLE as string]: requestSet,
          },
          ReturnConsumedCapacity: "NONE",
          ReturnItemCollectionMetrics: "NONE",
        })
        .promise()
    )
  );
};

export default {
  getStations,
  updateStations,
};
