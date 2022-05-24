import { Guest } from ".prisma/client";
import { getFeature } from "./feature";
import prisma from "./prisma";
import Slack from "./slack";

export const sendRsvpNotification = async (
  inviteCode: String,
  attendingGuests: Guest[],
  recipientNotes?: String
) => {
  const text = `:raised_hands: \`${inviteCode}\` has responded`;
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:raised_hands: \`${inviteCode}\` has responded`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Guests*",
        },
        {
          type: "plain_text",
          text: `${attendingGuests
            .map((g) => {
              return `${g.isAttending ? ":white_check_mark:" : ":x:"} ${
                g.firstName
              }`;
            })
            .join("\n")}`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`\`\`\n${recipientNotes}\n\`\`\``,
      },
    },
  ];
  await prepareAndSendMessage(text, blocks);
};

export const sendNotAttendingNotification = async (
  inviteCode: String,
  recipientNotes?: String
) => {
  const text = `:no_good: \`${inviteCode}\` will not attend`;
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:no_good: \`${inviteCode}\` will not attend`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`\`\`\n${recipientNotes}\n\`\`\``,
      },
    },
  ];
  await prepareAndSendMessage(text, blocks);
};

const prepareAndSendMessage = async (text: string, blocks: any) => {
  try {
    const channel = getFeature(
      "slackNotificationChannel",
      await prisma.feature.findMany()
    );
    const token = getFeature("slackBotToken", await prisma.feature.findMany());
    const slack = new Slack(token);
    await slack.sendMessage(channel, text, blocks);
  } catch (error) {
    console.error(error);
  }
};
