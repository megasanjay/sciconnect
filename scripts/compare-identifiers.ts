import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const main = () => {
  const inputFilePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "assets",
    "json",
    "dev",
    "identifiers-org.json",
  );

  const prefixFilePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "assets",
    "json",
    "prefix.json",
  );

  const inputData = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));

  const prefixData = JSON.parse(fs.readFileSync(prefixFilePath, "utf8"));

  const newIdentifiers = [];

  for (const input of inputData) {
    const prefix = input.value;

    const prefixInfo = prefixData.find((item: any) => item.prefix === prefix);

    if (!prefixInfo) {
      continue;
    }

    newIdentifiers.push(prefix);
  }

  const deprecatedPrefixes = [];

  for (const prefix of prefixData) {
    const identifier = inputData.find(
      (item: any) => item.value === prefix.value,
    );

    if (!identifier) {
      deprecatedPrefixes.push(prefix.prefix);
    }
  }

  console.log("New identifiers:" + newIdentifiers.join(", "));
  console.log("Deprecated prefixes:" + deprecatedPrefixes.join(", "));
};

main();
