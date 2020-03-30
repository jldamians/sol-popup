/*
  # Imagen de referencia:
    [*] 20191105 - Img 01 - confirmar telefono celular.PNG
    [*] 20191105 - Img 02 - cerrar alerta telefono.PNG
    [*] 20191105 - Img 03 - cerrar confirmacion telefono.PNG
  {
    "nombreCampania": "ModificaDatosRuc",
    "existe": true,
    "url": "/ol-ti-itmoddatosruc/campmodificadatosruc.htm?
      accion=MostrarFormCelularDifusionWS&
      ruc=10028643689&
      login=10028643689LASTONEX&
      sol=LASTONEX&
      origen=2&
      cntx=0&
      activar=OFF&
      nomCamClave=0019"
  }
*/

/*
  # Imagen de referencia:
    [*] 20191106 - Img 01 - confirmar correo electronico.PNG
    [*] 20191106 - Img 02 - cerrar alerta correo.PNG
    [*] 20191106 - Img 03 - cerrar confirmacion correo.PNG
  {
    "nombreCampania": "ModificaDatosRuc",
    "existe": true,
    "url": "/ol-ti-itmoddatosruc/campmodificadatosruc.htm?
      accion=inicioValidarCorreo&
      ruc=10094942409&
      login=10094942409NGMANCRA&
      sol=NGMANCRA&
      origen=2&
      cntx=0&
      nomCamClave=0209"
  }
*/

/*
  Cuando la campaña de modificación de datos lanza una
  solicitud ha "/ol-ti-itmoddatosruc/campmodificadatosruc.htm"
  la acción de cerrar el popup No terminará la sesión
*/

const Time = require('./Time');
const CloseMessage = require('./CloseMessage');
const CloseDialogs = require('./CloseDialogs');

class ClosePrimaryUserDialogs {
  constructor(frame) {
    this.frame = frame;
  }

  async close() {
    try {
      // Esperamos que el mensaje informativo sea visible en el DOM
      await this.frame.waitForSelector('#divfrm', {
        timeout: Time.getSeconds(20),
        visible: true,
      });

    } catch ({ message }) {
      throw new Error(`Los mensajes no han sido renderizados: ${message}`);
    }

    await CloseMessage(this.frame);
    await CloseDialogs(this.frame);
  }

  static getCampaignName() {
    return 'ModificaDatosRuc';
  }

  static getCampaignUrl() {
    return 'campmodificadatosruc.htm';
  }
}

exports = module.exports = async (frame) => {
  const dialogs = new ClosePrimaryUserDialogs(frame);

  await dialogs.close();
};

exports.its = (campaing) => {
  const verify = (
    campaing.name === ClosePrimaryUserDialogs.getCampaignName() &&
    campaing.url.indexOf(ClosePrimaryUserDialogs.getCampaignUrl()) !== -1
  );

  return verify;
};
