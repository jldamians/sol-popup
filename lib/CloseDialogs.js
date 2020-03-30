/*
  Administrar el cierre del Pop-Up de confirmación

  # Casos de uso
    1.- Confirmar su teléfono celular
      - 20191105 - Img 03 - cerrar confirmacion telefono.PNG
    2.- Confirmar su cuenta de correo electrónico
      - 20191106 - Img 03 - cerrar confirmacion correo.PNG
    3.- Confirmar indicar tributario
      - 20191206 - Img 01 - aceptar campaña perfil.PNG

  Anotación: Se ha podido apreciar que este mensaje
  puede aparecer hasta dos (2) veces en una misma sesión.

  Si utilizamos <<span#continuarSinRegistrarBtn>> para
  cerrar el dialogo de confirmación, existe la posibilida
  que al cerrar un primero, aparesca un segundo (teléfono y correo).

  Existe el elemento <<span#finalizarBtn>> que cierra todos
  los dialogos de confirmación. Dependiendo del caso de uso,
  este elemento permanecerá oculto (1 y 2) o visible (3).
*/

class CloseDialogs {
  constructor(frame) {
    this.frame = frame;
  }

  async close() {
    /*
      La siguiente instrucción de cierre queda descartada,
      puesto que en los casos de uso donde el elemento
      permanece oculto, puppeteer lanza la excepción:
        - Node is either not visible or not an HTMLElement

      ```javascript
      const selector = 'span#finalizarBtn';

      const closableBtn = await this.frame.waitForSelector(selector, {
        timeout: 10 * 1000,
        visible: false ,
      });

      await closableBtn.click();
      ```
    */
    try {
      // Lanzamos el evento click del elemento <<span#finalizarBtn>> de esta forma,
      // puesto que no importará que dicho elemento esté oculto (no visible)
      await this.frame.evaluate((selector) => {
        const closableBtn = document.querySelector(selector);

        closableBtn.click();
      }, this.getClosableButtonId());
    } catch (error) {
      throw new Error(`No se ha logrado cerrar el mensaje de confirmación: ${message}`);
    }
  }

  getClosableButtonId() {
    return 'span#finalizarBtn';
  }
}

module.exports = async (frame) => {
  const dialogs = new CloseDialogs(frame);

  await dialogs.close();
};
