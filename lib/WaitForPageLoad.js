const Time = require('./Time');

class WaitForPageLoad {
  constructor(page) {
    this.page = page;
  }

  async wait() {
    try {
      // Esperamos a que la nueva página y todos sus recursos hayan cargado
      await this.page.waitForFunction((state) => {
        return document.readyState === state;
      }, {
        timeout: Time.getSeconds(30),
        polling: 200,
      }, this.getState());
    } catch ({message}) {
      throw new Error(`La página está tardando en obtener sus recursos: ${message}`);
    }
  }

  getState() {
    return 'complete';
  }
}

module.exports = async (page) => {
  const complete = new WaitForPageLoad(page);

  await complete.wait();
};
