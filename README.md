# NicoMyListDownloader

Simple scripts to download playlist from niconico (https://nicovideo.jp)

## Features

* Download public playlist/series from niconico
  * For series, please refer https://nplll.com/2019/07/rss_for_niconico_video_series/ for Details.
* auto-increment index (one-based index) in filename for indexing directory

## Usages

#### From 2021. 03. 20~
niconico changes their video format, so NicoMyListDownloader can't handle properly with `smileinfo`. You have to run `setup.sh` once before downloading.

Make sure installed `node`, `python3`
1. Setup dependencies by `./setup.sh`
2. Give some value into `.env` file.

```
NICONICO_USERNAME=YOUR NICONICO EMAIL or id
NICONICO_PASSWORD=YOUR NICONICO PASSWORD
```

Running by...
* MyList: `npm run mylist ${PLAYLIST_ID}`
* Series: `npm run series ${PLAYLIST_ID}`
* Single: `npm run single ${VIDEO_ID}`

## Limitation

### Private playlist

Currently, NicoMyListDownloader can't handle `private playlist`. However, there is a way to make it work.

1. Enter `https://www.nicovideo.jp/mylist/{PLAYLIST}?rss=2.0` on browser (relace {PLAYLIST} to desired playlist id)
2. Saved on project root, with {PLAYLIST}.rss
3. Running script

### Rate Limit

Currently, Niconico has rate limit. (although you have premium subscription :(

```
ページにアクセスできません
混雑緩和のため、短時間での連続アクセスはご遠慮ください。
目安として1分以上の間隔を空けてのご利用をお願いいたします     

外部の先読みツールやブラウザの先読み機能などをご利用の場合、
意図しない過剰アクセスにより通常よりもこの表示がされやすくなる場合があります。
```

If you want to download large playlist, there is a way to make it work.

1. Running script
2. NicoMyListDownloader will skip already download file. If file has corrupted, just remove that file and re-running scripts
3. Repeat 1 step while all file were download.

## License

MIT License