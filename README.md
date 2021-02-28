# NicoMyListDownloader

Simple scripts to download playlist from niconico (https://nicovideo.jp)

## Usages

1. Installing dependencies `npm install`
2. Change `.env.example` to `.env` and add proper NICONICO_USERNAME, NICONICO_PASSWORD and NICONICO_PLAYLIST to download;
    * playlist id can be extract by url
    * if playlist url is https://www.nicovideo.jp/my/mylist/00000000, just enter 00000000 into NICONICO_PLAYLIST
3. `npm run start`

## Limitation

### Private playlist
Currently, NicoMyListDownloader can't handle `private playlist`. However, there is a way to make it work.
1. Enter https://www.nicovideo.jp/mylist/{NICONICO_PLAYLIST}?rss=2.0 on browser (relace {NICONICO_PLAYLIST} to desired playlist id)
2. Saved on project root, with {NICONICO_PLAYLIST}.rss
3. `npm run start`

### Rate Limit
Currently, Niconico has rate limit. 

```
ページにアクセスできません
混雑緩和のため、短時間での連続アクセスはご遠慮ください。
目安として1分以上の間隔を空けてのご利用をお願いいたします     

外部の先読みツールやブラウザの先読み機能などをご利用の場合、
意図しない過剰アクセスにより通常よりもこの表示がされやすくなる場合があります。
```

If you want to download large playlist, there is a way to make it work.
1. `npm run start`
2. If scripts raise Exception, enter `{NICONICO_PLAYLIST}.rss` file
3. Remove <item> element of already download
4. Wait some minutes (about 10 minutes)
5. Repeat 1 ~ 4 steps

## License
MIT License