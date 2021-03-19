import Parser from "rss-parser";
import fs from "fs";
import { resolve } from "path";
import { login } from "./Login";
import { VideoObject } from "./videoobject";
import {
  buildExtractorPath,
  checkEnvironment,
  makeFolder,
  saveRss,
} from "./Utils";

const exec = require("child_process").execSync;

require("dotenv").config();

async function download(
  video: VideoObject,
  targetPath: string
): Promise<boolean> {
  const username = process.env.NICONICO_USERNAME || "";
  const password = process.env.NICONICO_PASSWORD || "";

  // Duplicate file check
  const pad = `${video.index + 1}`.padStart(4, "0");
  const files = fs
    .readdirSync(targetPath)
    .filter((fn) => fn.startsWith(`${pad}-`));

  if (files.length > 0) {
    console.log(`Skipped download due to already exists file - ${files[0]}`);
    return false;
  }

  const extractor = buildExtractorPath();
  const command = `python ${extractor} -o ${resolve(
    targetPath
  )}/${pad}-%(title)s.%(ext)s -u ${username} -p ${password} https://www.nicovideo.jp/watch/${
    video.id
  }`;
  const result = exec(command);
  console.log(result.toString("utf8"));
  return true;
}

async function handleRss(id: string) {
  let parser = new Parser();
  const fileContent = fs.readFileSync(`${id}.rss`, "utf8");
  const feed = await parser.parseString(fileContent);

  const videos: VideoObject[] = (feed.items ?? [])
    .sort((a, b) => {
      const aDate = Date.parse(a.pubDate || "");
      const bDate = Date.parse(b.pubDate || "");
      return aDate - bDate;
    })
    .map((item, index: number) => new VideoObject(index, item.title, item.link))
    .sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));

  console.log("Ready download videos");
  videos.forEach((element) => {
    console.log(`${element.index} - ${element.title} (${element.id})`);
  });

  makeFolder(id);

  for (const video of videos) {
    await download(video, `./videos/${id}`);
  }
}

async function handleMyList() {
  const id = process.argv[3];
  if (!fs.existsSync(`${id}.rss`)) {
    await saveRss(id, `https://www.nicovideo.jp/mylist/${id}?rss=2.0`);
  }

  handleRss(id);
}

async function handleSeries() {
  const id = process.argv[3];
  if (!fs.existsSync(`${id}.rss`)) {
    await saveRss(id, `https://rss.1ni.co/series/${id}`);
  }

  handleRss(id);
}

async function handleSingle() {
  const id = process.argv[3];
  makeFolder(id);

  const url = `https://www.nicovideo.jp/watch/${id}`;
  const video = new VideoObject(0, "", url);
  download(video, `./videos/${id}`);
}

async function main() {
  checkEnvironment();

  const username = process.env.NICONICO_USERNAME || "";
  const password = process.env.NICONICO_PASSWORD || "";
  await login(username, password);

  const method = process.argv[2];
  if (method == "series") {
    handleSeries();
  } else if (method == "single") {
    handleSingle();
  } else {
    handleMyList();
  }
}

main();
