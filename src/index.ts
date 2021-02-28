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

  constructor(
    index: number,
    title: string | undefined,
    link: string | undefined
  ) {
    this.index = index;
    this.title = title ?? "";
    this.id = link?.replace("https://www.nicovideo.jp/watch/", "") ?? "";
  }
}

async function download(
  client: Nicovideo,
  video: VideoObject,
  targetPath: string
): Promise<string> {
  const data = await client.watch(video.id);
  const pad = `${video.index + 1}`.padStart(4, "0");
  const fileName =
    filenamify(`${pad}-` + data.video.title) + "." + data.video.movieType;
  const filePath = resolve(join(targetPath, fileName));
  await client.httpExport(data.video.smileInfo.url, filePath);
  return filePath;
}

async function parseMyListAndDownload(
  mylistId: string,
  email: string,
  password: string
) {
  if (!email || !password || !mylistId) {
    console.log("Email or Password or MyListId are missing!");
    return;
  }

  const session = await niconico.login(email, password);
  const client = new Nicovideo(session);
  let parser = new Parser();

  if (!fs.existsSync(`${mylistId}.rss`)) {
    const rssUrl = `https://www.nicovideo.jp/mylist/${mylistId}?rss=2.0`;
    const response = await axios.get(rssUrl);
    fs.writeFileSync(`${mylistId}.rss`, response.data, { encoding: null });
  }

  const fileContent = fs.readFileSync(`${mylistId}.rss`, "utf8");
  const feed = await parser.parseString(fileContent);

  const videos: VideoObject[] = (feed.items ?? [])
    .sort((a, b) => {
      const aDate = Date.parse(a.pubDate || "");
      const bDate = Date.parse(b.pubDate || "");
      return aDate - bDate;
    })
    .map((item, index: number) => new VideoObject(index, item.title, item.link))
    .sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));

  console.log("feed fetched");
  console.log(videos);

  if (!fs.existsSync("./videos")) {
    fs.mkdirSync("videos");
  }

  for (const video of videos) {
    const contents = await download(client, video, "./videos");
    console.log(`Download complete! ${contents}`);
  }
}

parseMyListAndDownload(
  process.env.NICONICO_PLAYLIST || "",
  process.env.NICONICO_USERNAME || "",
  process.env.NICONICO_PASSWORD || ""
);
