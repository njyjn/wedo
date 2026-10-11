import "server-only";
import { WebClient, type KnownBlock } from "@slack/web-api";

/** Escape text for Slack mrkdwn so guest-supplied text can't inject mentions or links. */
export function escapeSlack(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`/g, "'");
}

type RsvpNotification = {
  inviteCode: string;
  attending: boolean;
  guests: { firstName: string; isAttending: boolean }[];
  recipientNotes: string | null;
};

export async function sendRsvpNotification(
  channel: string,
  n: RsvpNotification,
): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || !channel) return;

  const code = escapeSlack(n.inviteCode);
  const text = n.attending
    ? `:raised_hands: \`${code}\` has responded`
    : `:no_good: \`${code}\` will not attend`;
  const blocks: KnownBlock[] = [
    { type: "section", text: { type: "mrkdwn", text } },
  ];
  if (n.attending) {
    blocks.push({
      type: "section",
      fields: [
        { type: "mrkdwn", text: "*Guests*" },
        {
          type: "plain_text",
          text:
            n.guests
              .map((g) => `${g.isAttending ? "✅" : "❌"} ${g.firstName}`)
              .join("\n") || "-",
        },
      ],
    });
  }
  if (n.recipientNotes) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "```\n" + escapeSlack(n.recipientNotes) + "\n```",
      },
    });
  }

  try {
    await new WebClient(token).chat.postMessage({ channel, text, blocks });
  } catch (error) {
    console.error("Slack notification failed", error);
  }
}
