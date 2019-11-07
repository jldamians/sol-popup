'use strict'

class PopupSOL {
  constructor(page=null) {
    this._page = page;

    this._frame = null;

    this._campaigns = [];

    this._page.on('response', async (response) => {
      try {
        const request = response.request();

        // Esta petición es realizada para determinar si el contribuyente tiene campañas,
        // las cuales serán informadas en ventanas emergentes después de pasar el login
        const successfulRequest = (
          request.url().indexOf('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm') != -1 &&
          response.status() == '200' &&
          request.method() == 'POST'
        );

        if (successfulRequest === true) {
          // Hemos verificado que se realiza dos peticiones a la misma url, pero con distinto contenido,
          // por ello, solo interceptaremos aquella petición cuyo contenido es "action=campana",
          // la cual se encarga con consultar las campañas activas del contribuyente
          if (request.postData() == 'action=campana') {
            // Obtenemos la respuesta de la solicitud/petición
            const responseData = await response.text();

            // Parseamos la respuesta de la solicitud/petición
            const campaigns = JSON.parse(responseData).map((campaign) => {
              return {
                url: campaign.url,
                exist: campaign.existe,
                name: campaign.nombreCampania,
              }
            });

            console.log(`[factiva-popup][${new Date().getTime()}] Recibiendo información de las campañas`);

            this._campaigns = campaigns;
          }
        }
      } catch(exception) {
        throw exception;
      }
    });
  }

  get page() {
    return this._page;
  }

  get frame() {
    return this._frame;
  }

  async close() {
    // Esperamos a que el cambio de página haya sido reflejado en el dom
    await this._page.waitForNavigation({
      waitUntil: 'domcontentloaded', timeout: 30 * 1000
    });

    // Esperamos a que la nueva página y todos sus recursos hayan cargado
    await this._page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { polling: 200, timeout: 30 * 1000 });

    // Verificamos que la autenticación se haya realizado correctamente,
    // para ello validamos que el elemento "div#divModalCampana" existe en el DOM
    await this.page.waitForSelector('div#divModalCampana', {
      timeout: 20 * 1000,
      // Indicamos que el elemento sea encontrado en cuanto
      // esté presente en el DOM sin importar que esté visible
      visible: false
    });

    // Extraemos la campaña que determina si existen popup's
    const campaign = this._campaigns.find((campaign) => {
      return campaign.name === 'ModificaDatosRuc';
    });

    if (campaign && campaign.exist === true) {
      console.log(`[factiva-popup][${new Date().getTime()}] Confirmando la existencia de aletas: ${campaign.name}`);

      // Evaluamos y extraemos el iframe que necestiamos,
      // para este caso, el iframe que contiene los Pop-Up
      this._frame = this._page.frames().find(($frame) => {
        return $frame.name() === 'ifrVCE';
      });

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

      // Cuando la campaña de modificación de datos lanza un
      // request ha "/ol-ti-itmoddatosruc/campmodificadatosruc.htm"
      // la acción de cerrar el popup No terminará la sesión
      const closablePopup = campaign.url.indexOf('/campmodificadatosruc.htm') !== -1;

      // Cuando la campaña de modificación de datos lanza un
      // request ha "/ol-ti-itmoddatosruc/campanhas.htm",
      // la acción de cerrar el popup terminará la sesión
      const nonClosablePopup = campaign.url.indexOf('/campanhas.htm') !== -1;

      if (closablePopup === true) {
        /*const { accion } = this._getURLParameters(campaign.url);

        if (accion === 'MostrarFormCelularDifusionWS') {
          console.log(`[factiva-popup][${new Date().getTime()}] Confirmando teléfono móvil`);
        } else if (accion === 'inicioValidarCorreo') {
          console.log(`[factiva-popup][${new Date().getTime()}] Confirmando correo electrónico`);
        }*/

        // Cerrando mensajes informativos
        await this._closeInformativeDialog();

        // Cerrando mensajes de confirmación
        await this._closeConfirmDialog();

      } else if (nonClosablePopup === true) {
        throw new Error('Importante, actualizar o confirmar los datos del contacto');
      } else {
        throw new Error(`Soporte, se deberá implementar nueva URL de campaña: ${campaign.url}`);
      }

      // Esperamos a que las alertas estén cerradas
      await this._page.waitFor((campaigns=[]) => {
        const popup = document.querySelector('div#divModalCampana');

        return popup.className === 'oculto';
      }, { timeout: 11 * 1000 }, this._campaigns);

      console.log(`[factiva-popup][${new Date().getTime()}] Confirmando el cierre de las alertas`);
    }

    console.log('cerrando...');
  }

  async _closeInformativeDialog() {
    //  # Imagen de referencia:
    //    [*] 20191105 - Img 02 - cerrar alerta telefono.PNG
    //    [*] 20191106 - Img 02 - cerrar alerta correo.PNG
    //  # Casos de uso
    //    [*] Confirmación del teléfono móvil
    //    [*] Confirmación del correo electrónico
    // Cerramos el Pop-Up de comunicados (IMPORTANTE)
    try {
      const selector = '#idthirdDialog > div.dijitDialogTitleBar > span.dijitDialogCloseIcon';

      const closeBtn = await this._frame.waitForSelector(selector, { timeout: 10 * 1000, visible: true });

      await closeBtn.click()
    } catch (exception) {
      throw new Error(`No se ha logrado cerrar el mensaje informativo`);
    }
  }

  async _closeConfirmDialog() {
    //  # Imagen de referencia:
    //    [*] 20191105 - Img 03 - cerrar confirmacion telefono.PNG
    //    [*] 20191106 - Img 03 - cerrar confirmacion correo.PNG
    //  # Casos de uso
    //    [*] Confirmar su teléfono celular
    //    [*] Confirmar su cuenta de correo electrónico
    // Cerramos el Pop-Up de confirmación
    try {
      /*
        # Pueden aparecer varios mensajes de confirmación (teléfono y correo), por ello
        # no cerraremos los mensajes con el elemento "#continuarSinRegistrarBtn".
        # Se ha experimentar que luego de cerrar el primero (teléfono), inmediatamente se laza otro (correo).

        # Utilizaremos el elemento "#finalizarBtn" que cerrará todos los mensaje de confirmación.
        # Cabe señalar que este elemento estará oculto en todo momento.

        # La siguiente instrucción queda descartada puesto que cuando gatillamos el evento click,
        # puppeteer no indica "Node is either not visible or not an HTMLElement"

        const selector = '#finalizarBtn';
        const closeBtn = await this._frame.waitForSelector(selector, { timeout: 10 * 1000, visible: false });
        await closeBtn.click();
      */

      // Lanzamos el evento click del elemento "#finalizarBtn" de esta forma,
      // puesto que no importará que dicho elemento esté oculto (no visible)
      await this._frame.evaluate(() => {
        document.querySelector("#finalizarBtn").click();
      });
    } catch ({message}) {debugger;
      throw new Error(`No se ha logrado cerrar el mensaje de confirmación: ${message}`);
    }
  }

  /*_getURLParameters(campaignURL=null) {
    let response;

    const hashes = campaignURL.slice(campaignURL.indexOf('?') + 1).split('&');

    hashes.map((hash) => {
      const [key, val] = hash.split('=');

      response = response || {};

      response[key] = decodeURIComponent(val);
    });

    return response;
  }*/
}

module.exports = PopupSOL;

function PopupMessage(page) {
  let _args = {
    page,
    frame: null
  }

  Object.defineProperty(this, 'page', {
    get: () => { return _args.page },
  })

  Object.defineProperty(this, 'frame', {
    get: () => { return _args.frame },
    set: (value) => { _args.frame = value }
  })
}

/**
 * Cierra las ventanas emergentes informativas y de confirmación
 */
PopupMessage.prototype.close = async function() {
  // Verificamos si la autenticación ha sido realizada correctamente,
  // para ello, validamos que la sección Pop-Up haya sido creada en el DOM
  try {
    await this.page.waitForSelector('iframe#ifrVCE', {
      timeout: 15000,
      // Configuramos esta opción porque el iframe
      // puede estar oculto al no existir alertas
      visible: false
    })

    // Evaluamos y extraemos el iframe que necestiamos,
    // para este caso, el iframe que contiene los Pop-Up
    this.frame = this.page.frames().find((frame) => {
      return frame.name() === 'ifrVCE'
    })

    // NOTE: Si el body del frame "ifrVCE" tiene asignada la clase "tundra",
    // se entiende que existen modales informativos abiertos
    try {
      await this.frame.waitForSelector('body.tundra', {
        timeout: 15000,
        visible: true // default
      })

      // Administramos los siguientes comunicados:
      // - IMPORTANTE ... actualmente hemos identificado dos (2) tipos
      await _closeCommuniqueDialogs.bind(this)()

      // Administramos los siguientes mensajes de confirmación:
      // - CONFIRMAR SU TELÉFONO CELULAR
      // - CONFIRMAR SU CUENTA DE CORREO ELECTRÓNICO
      await _closeConfirmDialogs.bind(this)()

      // Administramos otros mensajes:
      // - Confirmar su cuenta de correo electrónico
      try {
        const FinalizeMessageButton = await this.frame.waitForSelector('#finalizarBtn', {
          timeout: 10000,
          visible: true
        })

        await FinalizeMessageButton.click()
      } catch (e) {
        // NOTE: NO controlar la excepción puesto que los Pop-Up son opcionales

        //throw e
      }
    } catch (e) {
      // NOTE: No controlar la excepción puesto que los Pop-Up son opcionales

      //throw e
    }
  } catch (e) {
    throw new Error(
      'La autenticación ha sido incorrecta'
    )
  }
}

async function _closeConfirmDialogs(counting = 1) {
  // Verificamos si los Pop-Up de confirmación de datos
  // están abiertos, para proceder con el cierre de los mismos
  try {
    const ContinueWithoutConfirmingButton = await this.frame.waitForSelector('#continuarSinRegistrarBtn', {
      timeout: 10000,
      visible: true
    })

    // TODO: Actualmente dormimos el proceso por 1s para que termine de carga el evento
    // del elemento seleccionado. Queda pendiente ver otra forma de cerrar el segundo modal
    await this.frame.waitFor(1000)

    await ContinueWithoutConfirmingButton.click()

    // Permitimos la recursividad solo hasta 2 veces, puesto que de momento
    // sólo hemos identificado los siguientes mensajes de confirmación:
    // - CONFIRMAR SU TELÉFONO CELULAR
    // - CONFIRMAR SU CUENTA DE CORREO ELECTRÓNICO
    if (counting < 2) {
      await this.frame.waitFor(1000)

      // Invocamos la función de forma recursiva, a fin de cerrar
      // todos los Pop-Up de confirmación que hayan sido lanzados
      await _closeConfirmDialogs.bind(this)(counting + 1)
    }
  } catch (e) {
    // NO controlar la excepción puesto que los Pop-Up son opcionales,
    // es decir, solo debemos cerrarlos cuando estén abiertos

    //throw e
  }
}

async function _closeCommuniqueDialogs() {
  // NOTE: Verificamos si el Pop-Up de comunicados (IMPORTANTE)
  // está abierto, para proceder con el cierre del mismo
  try {
    const CommuniqueCloseButton = await this.frame.waitForSelector('#idthirdDialog > div.dijitDialogTitleBar > span.dijitDialogCloseIcon', {
      timeout: 10000,
      visible: true
    })

    await CommuniqueCloseButton.click()
  } catch (e) {
    // NOTE: NO controlar la excepción puesto que los Pop-Up son opcionales

    //throw e
  }

  // Verificamos si el Pop-Up de comunicado (IMPORTANTE)
  // lanzado emitidos a usuarios secundarios está abierto,
  // para proceder con el cierre del mismo
  try {
    const CommuniqueCloseButton = await this.frame.waitForSelector('#idthirdDialogUsuSec > div.dijitDialogTitleBar > span.dijitDialogCloseIcon', {
      timeout: 10000,
      visible: true
    })

    await CommuniqueCloseButton.click()
  } catch (e) {
    // NOTE: NO controlar la excepción puesto que los Pop-Up son opcionales

    //throw e
  }
}
