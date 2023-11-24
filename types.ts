export type Station = {
  id: number;
  name: string;
  city: {
    id: number;
    country: string;
    country_name: string;
    country_translated: string;
  };
};

export type Relation = {
  startStation: number;
  endStation: number;
};

export type RelationWithDate = {
  startStation: number;
  endStation: number;
  timeWindow: { startDate: string; endDate: string };
};

export type ReadableRelationWithDate = {
  startStation: string;
  endStation: string;
  timeWindow: { startDate: string; endDate: string };
};
