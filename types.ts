export type TokenRes = {
  last_updated_timestamp: number;
  price: number; // In copper
};

export type CurrencyRes = {
  date: string; // 2024-05-05
  usd: Record<string, number>;
  eur: Record<string, number>;
};

export type CountriesRes = {
  [code: string]: {
    country_name: string; // "afghanistan";
    country_iso3: string; // "afg";
    country_iso_numeric: string; // "4";
    currency_name: string; // "afghani";
    currency_code: string; // "afn";
    currency_number: string; // "971";
  };
};

export type NamesRes = Record<string, string>;
