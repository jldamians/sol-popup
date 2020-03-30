const url = require('url');
const querystring = require('querystring');

class GetCampaignInformation {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }

  successful() {
    const status = this.response.status();
    const method = this.request.method();
    const wsUrl = this.request.url();

    const wasSuccessfulResponse = (
      wsUrl.indexOf(this.getUrl()) !== 1 && status === this.getStatus() && method === this.getMethod()
    );

    return wasSuccessfulResponse;
  }

  async get() {
    let campaign,
        requestData,
        responseData,
        parsedQs,
        parsedUrl;

    // verificamos si la petición es satisfactoria
    if (!this.successful()) {
      return null;
    }

    // verificamos si la petición realizada corresponde
    // a la obtención de los datos de campaña
    requestData = this.request.postData();

    if (requestData !== this.getRequestAction()) {
      return null;
    }

    // obtenemos la campaña solo si es una de las permitidas
    responseData = await this.response.text();

    campaign = JSON.parse(responseData).find((campaign) => {
      const allowedCampaigns = this.getAllowedCampaigns();

      const allowed = (
        allowedCampaigns.includes(campaign.nombreCampania) === true && campaign.existe === true
      );

      return allowed;
    });

    if (!campaign) {
      return null;
    }

    // parsear la url para extraer la query
    parsedUrl = url.parse(campaign.url);

    // convertir en objeto la query de la url
    parsedQs = querystring.parse(parsedUrl.query);

    return {
      url: campaign.url,
      exist: campaign.existe,
      name: campaign.nombreCampania,
      qs: parsedQs
    };
  }

  /**
   * El portal SOL de SUNAT realiza peticiones a esta url,
   * con la finalidad de conocer si el contribuyente tiene
   * alguna campaña activa, la cual será mostraad al mismo
   * en forma de venta emergente tras realiar la autenticación
   */
  getUrl() {
    return 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';
  }

  /**
   * El estado de la petición debe ser satisfactoria (200)
   */
  getStatus() {
    return 200;
  }

  /**
   * El método de la petición realizada deber ser POST
   */
  getMethod() {
    return 'POST';
  }

  getAllowedCampaigns() {
    return [
      'CampanhaPerfil',
      'ModificaDatosRuc',
    ];
  }

  getRequestAction() {
    return 'action=campana';
  }
}

module.exports = (response) => {
  const request = response.request();

  const campaign = new GetCampaignInformation(request, response);

  return {
    successful: () => {
      return campaign.successful();
    },
    information: async () => {
      const information = await campaign.get();

      return information;
    }
  };
};
