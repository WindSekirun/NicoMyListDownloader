export class VideoObject {
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