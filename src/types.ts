export type ApiStation = {
  id: number;
  name: string;
  city: {
    id: number;
    country: string;
    country_name: string;
    country_translated: string;
  };
};

export type ApiStationDetails = {
  city: {
    id: number;
    name: string;
    country: string;
    country_name: string;
    country_translated: string;
  };
  id: number;
  address: string;
  name: string;
  timezone: string;
  zip: string;
  google_link: string;
  one_way: boolean;
};

export type Station = {
  id: string;
  name: string;
  city: {
    id: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    country: string;
    country_name: string;
    country_translated: string;
    name: string;
  };
};

export type Relation = {
  startStation: string;
  endStation: string;
};

export type RelationWithDates = {
  startStation: string;
  endStation: string;
  timeWindows: { startDate: Date; endDate: Date }[];
};

export type ReadableRelationWithDate = Relation & {
  timeWindows: { startDate: string; endDate: string }[];
};
