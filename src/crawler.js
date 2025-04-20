const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

/**
 * 音频爬虫类
 * @class AudioCrawler
 */
class AudioCrawler {
  /**
   * @constructor
   * @param {Object} options - 配置选项
   * @param {string} options.savePath - 音频保存路径
   */
  constructor(options = {}) {
    this.savePath = options.savePath || path.join(__dirname, "../downloads");
    this.browser = null;
  }

  /**
   * 初始化浏览器
   */
  async init() {
    this.browser = await puppeteer.launch({
      headless: false, // 设置为 false 可以看到浏览器界面
      defaultViewport: null,
    });
  }

  /**
   * 下载音频文件
   * @param {string} url - 音频文件URL
   * @param {string} filename - 保存的文件名
   */
  async downloadAudio(url, filename) {
    try {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(path.join(this.savePath, filename));
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (error) {
      console.error("下载失败:", error);
      throw error;
    }
  }

  /**
   * 爬取音频数据
   * @param {string} url - 目标网页URL
   */
  async crawl(url) {
    try {
      await this.init();
      const page = await this.browser.newPage();

      // 设置请求拦截
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (request.resourceType() === "media") {
          // 这里可以处理音频请求
          console.log("发现音频请求:", request.url());
          // 下载音频
          this.downloadAudio(request.url(), `audio_${Date.now()}.mp3`);
        }
        request.continue();
      });

      await page.goto(url, {
        waitUntil: "networkidle0",
      });

      // 这里可以添加具体的页面操作逻辑
      // 例如：点击按钮、等待加载等
    } catch (error) {
      console.error("爬取失败:", error);
    } finally {
      await this.browser.close();
    }
  }
}

module.exports = AudioCrawler;
