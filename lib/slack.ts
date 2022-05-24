import { WebClient } from "@slack/web-api";

class Slack {
  client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async sendMessage(channel: string, text?: string, blocks?: any) {
    try {
      await this.client.chat.postMessage({
        channel: channel,
        text: text,
        blocks: blocks,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default Slack;
