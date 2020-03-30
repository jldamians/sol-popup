/*
  # Imagen de referencia:
    [*] 20191206 - Img 01 - aceptar campaña perfil.PNG
  {
    "nombreCampania": "CampanhaPerfil",
    "existe": true,
    "url": "/ol-ti-itmoddatosruc/campmodificadatosruc.htm?
      accion=inicioMostrarMessagePefil&
      ruc=10066920939&
      login=10066920939DEMANCLA&
      sol=DEMANCLA&
      origen=2"
  }
*/

const Time = require('./Time');
const CloseDialogs = require('./CloseDialogs');

class CloseSecondaryUserDialogs {
  constructor(frame) {
    this.frame = frame;
  }

  async close() {
    try {
      // Esperamos que el mensaje informativo sea visible en el DOM
      await this.frame.waitForSelector('div#divfrmCampUsuSec', {
        timeout: Time.getSeconds(20),
        visible: true,
      });
    } catch ({ message }) {
      throw new Error(`El mensaje no han sido renderizado: ${message}`);
    }

    await CloseDialogs();
  }

  static getCampaignName() {
    return 'CampanhaPerfil';
  }
}

exports = module.exports = async (frame) => {
  const dialogs = new CloseSecondaryUserDialogs(frame);

  await dialogs.close();
};

exports.its = (campaing) => {
  const verify = (
    campaing.name === CloseSecondaryUserDialogs.getCampaignName()
  );

  return verify;
};
