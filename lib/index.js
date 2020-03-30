const WaitForPageLoad = require('./WaitForPageLoad');
const GetCampaignSection = require('./GetCampaignSection');
const GetCampaignInformation = require('./GetCampaignInformation');
const WaitForCampaignSectionLoad = require('./WaitForCampaignSectionLoad');
const VerifyIfCampaignSectionIsClosed = require('./VerifyIfCampaignSectionIsClosed');

const HideCampaignSection = require('./HideCampaignSection');
const ClosePrimaryUserDialogs = require('./ClosePrimaryUserDialogs');
const CloseSecondaryUserDialogs = require('./CloseSecondaryUserDialogs');

class PopupSOL {
  constructor(page) {
    this.page = page;

    this.frame = null;
    this.campaign = null;

    this.page.on('response', async (response) => {
      try {
        const campaign = GetCampaignInformation(response);

        if (campaign.successful() === true && this.campaign === null) {
          this.campaign = await campaign.information();
        }
      } catch(exception) {
        throw exception;
      }
    });
  }

  async close() {
    await WaitForPageLoad(this.page);

    await WaitForCampaignSectionLoad(this.page);

    if (this.campaign) {
      this.frame = await GetCampaignSection(this.page);

      if (ClosePrimaryUserDialogs.its(this.campaign) === true) {
        await ClosePrimaryUserDialogs(this.frame);
      } else if (CloseSecondaryUserDialogs.its(this.campaign) === true) {
        await CloseSecondaryUserDialogs(this.frame);
      } else if (HideCampaignSection.its(this.campaign) === true) {
        await HideCampaignSection(this.page);
      } else {
        throw new Error(`La campaña no ha sido implementada: ${this.campaign.name} - ${this.campaign.url}`);
      }

      await VerifyIfCampaignSectionIsClosed(this.page);
    }
  }
}

module.exports = PopupSOL;
