const AudioCrawler = require("./crawler");

async function main() {
  const crawler = new AudioCrawler({
    savePath: "./downloads", // 自定义保存路径
  });

  try {
    await crawler.crawl("https://example.com/audio-page");
  } catch (error) {
    console.error("程序执行失败:", error);
  }
}

main();
