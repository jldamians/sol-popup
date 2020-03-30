const Time = require('./Time');

class GetCampaignSection {
  constructor(page) {
    this.page = page;
  }

  // Evaluamos y extraemos el iframe que necestiamos,
  // para este caso, el iframe que contiene los Pop-Up
  async get() {
    let frame;

    try {
      await this.page.waitForSelector(this.getFrameId(), {
        timeout: Time.getSeconds(30),
        visible: true,
      });
    } catch (error) {
      throw new Error(`El área de las alertas no ha sido creada: ${message}`);
    }

    frame = this.page.frames().find((frame) => {
      return frame.name() === this.getFrameName();
    });

    return frame || null;
  }

  getFrameName() {
    return 'ifrVCE';
  }

  getFrameId() {
    return 'iframe#ifrVCE';
  }
}

module.exports = async (page) => {
  const popup = new GetCampaignSection(page);

  const frame = await popup.get();

  return frame;
};
