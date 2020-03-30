"use strict";

const puppeteer = require('puppeteer');
const LoginSOL = require('sol-login');

const PopupSOL = require('../lib')

class SUNAT extends PopupSOL {
  constructor(page=null) {
    super(page);
  }

  async login() {
    const sol = await new LoginSOL(this.page);

    await sol.signin(...arguments);
  }
}

const chromeOptions = {
  headless: false,
  slowMo: 10,
  defaultViewport: null
};

(async function main() {
  const browser = await puppeteer.launch(chromeOptions);

  const page = await browser.newPage();

  await page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm');

  const sunat = new SUNAT(page);

  await sunat.login('15604369336', 'OCONVOTH', 'scisroltu');

  await sunat.close();
})();

