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

export type RelationWithDates = {
  startStation: number;
  endStation: number;
  timeWindows: { startDate: Date; endDate: Date }[];
};

export type ReadableRelationWithDate = {
  startStation: string;
  endStation: string;
  timeWindows: { startDate: string; endDate: string }[];
};
