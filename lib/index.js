'use strict'

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
  // NOTE: Verificamos si la autenticación ha sido realizada correctamente,
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
        timeout: 10000,
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
          timeout: 5000,
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
      timeout: 5000,
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
      timeout: 5000,
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
      timeout: 5000,
      visible: true
    })

    await CommuniqueCloseButton.click()
  } catch (e) {
    // NOTE: NO controlar la excepción puesto que los Pop-Up son opcionales

    //throw e
  }
}

module.exports = PopupMessage
