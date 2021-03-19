import fs from "fs";
import axios from "axios";
import { resolve } from "path";

require("dotenv").config();

export function error(message: string) {
  console.error(message);
}

export function checkEnvironment() {
  // check username, password
  const username = process.env.NICONICO_USERNAME || "";
  const password = process.env.NICONICO_PASSWORD || "";
  if (!username || !password) {
    error("Email or Password are missing!");
    return;
  }

  // check extractor
  const extractor = buildExtractorPath();
  if (!fs.existsSync(extractor)) {
    error("Extractor is missing!");
    return;
  }

  // check method
  const method = process.argv[2];
  const id = process.argv[3];

  if (method == "series" && !id) {
    error("NICONICO_SERIES_ID is missing!");
    return;
  }

  if (method == "single" && !id) {
    error(
      "Usage: npm run start-single {VIDEO ID} ex) npm run start-single sm38452119"
    );
    return;
  }

  if (method == "mylist" && !id) {
    error("NICONICO_PLAYLIST_ID is missing!");
    return;
  }
}

export function buildExtractorPath() {
  return resolve("./youtube-dl/youtube_dl/__main__.py");
}

export function makeFolder(id: string) {
  if (!fs.existsSync(`./videos/`)) {
    fs.mkdirSync(`videos/`);
  }

  if (!fs.existsSync(`./videos/${id}`)) {
    fs.mkdirSync(`videos/${id}`);
  }
}

export async function saveRss(id: string, url: string): Promise<boolean> {
  const response = await axios.get(url);
  fs.writeFileSync(`${id}.rss`, response.data, { encoding: null });
  return true
}
