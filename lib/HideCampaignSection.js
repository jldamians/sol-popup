/*
  {
    "nombreCampania": "ModificaDatosRuc"
    "existe": true
    "url": "/ol-ti-itmoddatosruc/campanhas.htm?
      accion=inicio&
      ruc=15604369336&
      login=15604369336OCONVOTH&
      sol=OCONVOTH&
      origen=2&
      correo=true&
      sms=true&
      solicitar=false"
  }
*/

/*
  Cuando la campaña de modificación de datos lanza un
  request ha "/ol-ti-itmoddatosruc/campanhas.htm",
  la acción de cerrar el popup terminará la sesión
*/

class HideCampaignSection {
  constructor(page) {
    this.page = page;
  }

  async close() {
    try {
      await this.page.evaluate(function(selector, className) {
        const backPopup = document.querySelector(selector);

        backPopup.className = className;
      }, this.getBackPopupId(), this.getHideClass());

      await this.page.evaluate(function(selector, className) {
        const frontPopup = document.querySelector(selector);

        frontPopup.className = className;
      }, this.getFrontPopupId(), this.getHideClass());
    } catch ({ message }) {
      throw new Error(`Error al ocultar la sección de campañas: ${message}`);
    }
  }

  getHideClass() {
    return 'oculto';
  }

  getBackPopupId() {
    return 'div#divModalCampanaBak';
  }

  getFrontPopupId() {
    return 'div#divModalCampana';
  }

  static getCampaignName() {
    return 'ModificaDatosRuc';
  }

  static getCampaignUrl() {
    return 'campanhas.htm';
  }
}

exports = module.exports = async (page) => {
  const dialogs = new HideCampaignSection(page);

  await dialogs.close();
};

exports.its = (campaing) => {
  const verify = (
    campaing.name === HideCampaignSection.getCampaignName() &&
    campaing.url.indexOf(HideCampaignSection.getCampaignUrl()) !== -1
  );

  return verify;
};
