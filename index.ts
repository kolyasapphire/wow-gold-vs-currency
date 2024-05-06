import { load } from "@std/dotenv";
import { wow } from "blizzard.js";

import type { TokenRes, CurrencyRes, CountriesRes, NamesRes } from "./types.ts";

const handle = async () => {
  await load({ export: true });

  const KEY = Deno.env.get("KEY");
  const SECRET = Deno.env.get("SECRET");

  if (!KEY || !SECRET) throw new Error("Bad config");

  const kv = await Deno.openKv();

  const inCache = await kv.get(["data"]);

  if (inCache.value) {
    console.debug("In cache");
    return Response.json(inCache.value);
  }

  console.debug("Not in cache");

  const wowClient = await wow.createInstance({
    key: KEY,
    secret: SECRET,
    origin: "us", // optional
    locale: "en_US", // optional
    // Not needed
    // token: "", // optional
  });

  // Originally in copper, so gold = x / 100 / 100
  const goldPerToken = (await wowClient.token<TokenRes>()).data.price / 10000;
  console.debug(goldPerToken, "gold per token");

  // Prices for WoW token
  // https://us.shop.battle.net/en-us/product/world-of-warcraft-token
  // USD 20
  // EUR 20
  // GBP 15
  const goldPerDollar = goldPerToken / 20;
  console.debug(goldPerDollar, "gold per USD");

  const currencyNamesRes = await fetch(
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.min.json",
  );
  const currencyNames = (await currencyNamesRes.json()) as NamesRes;

  const countriesRes = await fetch(
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/country.json",
  );
  const countriesJson = (await countriesRes.json()) as CountriesRes;
  const countryCodes = Object.values(countriesJson).map((x) => x.currency_code);

  const currenciesRes = await fetch(
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
  );
  const currencies = ((await currenciesRes.json()) as CurrencyRes).usd;
  console.debug(Object.values(currencies).length, "currencies loaded");

  const withoutCrypto = Object.entries(currencies).filter((x) =>
    countryCodes.find((y) => y.toLowerCase() === x[0].toLowerCase()),
  );

  const withNames = withoutCrypto.map((x) => [x[0], x[1], currencyNames[x[0]]]);

  const withGold = [
    ...withNames,
    ["wow-gold", goldPerDollar, "World of Warcraft Gold"],
  ] as [string, number, string][];

  const sorted = withGold.toSorted((a, b) => a[1] - b[1]);

  // Should be around 180 in the world
  // https://en.wikipedia.org/wiki/List_of_circulating_currencies
  console.debug(
    "Filtered to",
    sorted.length,
    "without crypto and with gold added",
  );

  const formatted = sorted.map((x, ix) => ({
    id: x[0],
    place: ix + 1,
    name: x[2],
    value: x[1],
  }));

  // biome-ignore lint: We put it there!
  const goldPosition = formatted.find((x) => x.id === "wow-gold")!.place;

  console.debug("Gold position is", goldPosition);

  // Keeps output neat
  const sliced = formatted.slice(
    goldPosition - 5 - 1, // 5 before gold
    goldPosition + 5 + 1 - 1, // 5 after gold
  );

  // biome-ignore lint: forEach is good enough
  sliced.forEach((x) => console.debug(...Object.values(x)));

  const final = { data: sliced, totalItems: withGold.length, goldPosition };

  await kv.set(["data"], final, { expireIn: 3 * 60 * 60 * 1000 });
  console.debug("Added to cache");

  return Response.json(final);
};

Deno.serve(handle);
