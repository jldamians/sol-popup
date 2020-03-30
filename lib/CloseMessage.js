/*
  Administrar el cierre del Pop-Up de comunicados (IMPORTANTE)

  # Casos de uso
    [*] Confirmación del teléfono móvil
      - image: 20191105 - Img 02 - cerrar alerta telefono.PNG
    [*] Confirmación del correo electrónico
      - image: 20200327 - Img 02 - cerrar alerta actualización.PNG
    [*] Confirmación de los datos de contacto
      - image: 20191106 - Img 02 - cerrar alerta correo.PNG

  Anotación: Se ha podido apreciar que este mensaje
  aparece una (1) vez en una misma sesión
*/

const Time = require('./Time');

class CloseMessage {
  constructor(frame) {
    this.frame = frame;
  }

  async close() {
    // Esperamos que el mensaje informativo haya sido
    // renderizado en el DOM del documento HTML y sea visible
    try {
      await this.frame.waitForSelector(this.getMessageContainerId(), {
        timeout: Time.getSeconds(30),
        visible: true,
      });
    } catch ({ message }) {
      throw new Error(`La sección de mensajes informativos no ha sido rederizado: ${message}`);
    }

    try {
      const closableBtn = await this.frame.waitForSelector(this.getClosableButtonId(), {
        timeout: Time.getSeconds(10),
        visible: true,
      });

      await closableBtn.click();
    } catch ({ message }) {
      throw new Error(`No se ha logrado cerrar el mensaje informativo: ${message}`);
    }
  }

  getMessageContainerId() {
    return 'div#divMensajeInformativo';
  }

  getClosableButtonId() {
    const selector = (
      'div#divMensajeInformativo > div#idthirdDialog > div.dijitDialogTitleBar > span.dijitDialogCloseIcon'
    );

    return selector;
  }
}

module.exports = async (frame) => {
  const dialogs = new CloseMessage(frame);

  await dialogs.close();
};
