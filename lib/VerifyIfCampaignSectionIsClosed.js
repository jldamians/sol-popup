const Time = require('./Time');

class VerifyIfCampaignSectionIsClosed {
  constructor(page) {
    this.page = page;
  }

  async verify() {
    try {
      await this.page.waitFor((selector, className) => {
        const popup = document.querySelector(selector);

        return popup.className === className;
      }, {
        timeout: Time.getSeconds(15),
      }, this.getCampaignSectionId(), this.getHideClass());
    } catch ({ message }) {
      throw new Error(`La sección de campañas no ha sido cerrada: ${message}`);
    }
  }

  getCampaignSectionId() {
    return 'div#divModalCampana';
  }

  getHideClass() {
    return 'oculto';
  }
}

module.exports = async (page) => {
  const campaign = new VerifyIfCampaignSectionIsClosed(page);

  await campaign.verify();
}
