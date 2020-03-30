const Time = require('./Time');

class WaitForCampaignSectionLoad {
  constructor(page) {
    this.page = page;
  }

  // Verificamos que la autenticación se haya realizado correctamente,
  // para ello validamos que el elemento "div#divModalCampana" existe en el DOM
  async check() {
    try {
      await this.page.waitForSelector(this.getContainerId(), {
        timeout: Time.getSeconds(30),
        // Indicamos que el elemento sea encontrado en cuanto
        // esté presente en el DOM sin importar que esté visible
        visible: false,
      });

      await this.page.waitForSelector(this.getFrameId(), {
        timeout: Time.getSeconds(30),
        // Indicamos que el elemento sea encontrado en cuanto
        // esté presente en el DOM sin importar que esté visible
        visible: false,
      });
    } catch ({message}) {
      throw new Error(`El área de las alertas no ha sido creada: ${message}`);
    }
  }

  getContainerId() {
    return 'div#divModalCampana';
  }

  getFrameId() {
    return 'iframe#ifrVCE';
  }
}

module.exports = async (page) => {
  const dialogs = new WaitForCampaignSectionLoad(page);

  await dialogs.check();
};
