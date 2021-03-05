import { niconico, Nicovideo } from "niconico";
import Parser from "rss-parser";
import fs from "fs";
import filenamify from "filenamify";
import { join, resolve } from "path";
import axios from "axios";
require("dotenv").config();

class VideoObject {
  title: string = "";
  id: string = "";
  index: number = 0;

  constructor(index: number, title: string | undefined, link: string | undefined) {
    this.index = index;
    this.title = title ?? "";
    this.id = link?.replace("https://www.nicovideo.jp/watch/", "") ?? "";
  }
}

async function download(client: Nicovideo, video: VideoObject, targetPath: string): Promise<[boolean, string]> {
  const pad = `${video.index + 1}`.padStart(4, "0");
  const files = fs.readdirSync(targetPath).filter(fn => fn.startsWith(`${pad}-`));
  if (files.length > 0) {
    console.log(`Skipped download due to already exists file - ${files[0]}`);
    return [false, files[0]];
  }

  const data = await client.watch(video.id);
  const fileName = filenamify(`${pad}-` + data.video.title.trim()) + "." + data.video.movieType;
  const filePath = resolve(join(targetPath, fileName));
  if (!fs.existsSync(filePath)) {
    await client.httpExport(data.video.smileInfo.url, filePath);
  } else {
    console.log("Skipped download due to already exists file");
  }
  return [true, filePath];
}

async function handleRss(client: Nicovideo, id: string) {
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
    console.log(`${element.index} - ${element.title} (${element.id})`)
  })

  if (!fs.existsSync(`./videos/${id}`)) {
    fs.mkdirSync(`videos/${id}`);
  }

  for (const video of videos) {
    const contents = await download(client, video, `./videos/${id}`);
    if (contents[0]) {
      console.log(`Download complete! ${contents[1]}`);
    }
  }
}

async function handleMyList(client: Nicovideo, id: string) {
  if (!fs.existsSync(`${id}.rss`)) {
    const rssUrl = `https://www.nicovideo.jp/mylist/${id}?rss=2.0`;
    const response = await axios.get(rssUrl);
    fs.writeFileSync(`${id}.rss`, response.data, { encoding: null });
  }

  handleRss(client, id)
}

async function handleSeries(client: Nicovideo, id: string) {
  if (!fs.existsSync(`${id}.rss`)) {
    const rssUrl = `https://rss.1ni.co/series/${id}`;
    const response = await axios.get(rssUrl);
    fs.writeFileSync(`${id}.rss`, response.data, { encoding: null });
  }

  handleRss(client, id)
}

async function main() {
  const username = process.env.NICONICO_USERNAME || ""
  const password = process.env.NICONICO_PASSWORD || ""
  if (!username || !password) {
    console.log("Email or Password are missing!");
    return;
  }

  const session = await niconico.login(username, password);
  const client = new Nicovideo(session);

  const method = process.argv[2];
  if (method == "series") {
    const id = process.env.NICONICO_SERIES_ID || "";
    if (!id) {
      console.log("NICONICO_SERIES_ID is missing!")
      return;
    }
    handleSeries(client, id)
  } else {
    const id = process.env.NICONICO_PLAYLIST_ID || "";
    if (!id) {
      console.log("NICONICO_PLAYLIST_ID is missing!")
      return;
    }
    handleMyList(client, id)
  }
}

main()