import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import QRCode from "qrcode";
import { normalizeInviteCode } from "@/lib/invite-code";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";
import { THEMES } from "@/lib/theme";
import styles from "./about.module.css";

const SOURCE_URL = "https://github.com/njyjn/wedo";

export const metadata: Metadata = {
  title: "About",
  description:
    "An open-source wedding website with invites, RSVPs, seating and check-in: one code per household, from the printed card to the door.",
};

function Frame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.url}>{url}</span>
      </div>
      {children}
    </div>
  );
}

function Feature({
  eyebrow,
  title,
  body,
  bullets,
  figure,
  caption,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string[];
  bullets: string[];
  figure: React.ReactNode;
  caption: string;
  reverse?: boolean;
}) {
  return (
    <section className={styles.section}>
      <div
        className={`${styles.wrap} ${styles.grid} ${reverse ? styles.reverse : ""}`}
      >
        <div className={styles.text}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className={styles.display}>{title}</h2>
          {body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className={styles.bullets}>
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <figure className="m-0">
          {figure}
          <figcaption className={styles.caption}>{caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}

// The mockups below use fictional guests and are drawn in HTML on the theme tokens: the
// repository ships no screenshots (see tests/repo-hygiene.test.ts).

function InviteMock() {
  return (
    <Frame url="wedo.example/rsvp/K7QM4PXR">
      <div className={styles.cover}>
        <p className={styles.tiny}>You’re invited</p>
        <p className={`${styles.display} ${styles.coverNames}`}>Alex & Sam</p>
        <p className={styles.coverLine}>Saturday, 14 November 2026</p>
        <p className={styles.coverLine}>The Garden Ballroom</p>
        <span className={styles.pill}>34 days to go</span>
      </div>
      <div className={styles.paper}>
        <h3 className={styles.display}>Dearest Mr. & Mrs. Jordan Tan,</h3>
        <p className="mt-2 mb-0">
          Together with our families, we joyfully invite you to our wedding.
        </p>
        <div className={styles.rule} />
        <p className={`${styles.tiny} mb-0`}>When</p>
        <p className="mb-2">Saturday, 14 November 2026 at 7:00 pm</p>
        <p className={`${styles.tiny} mb-0`}>Where</p>
        <p className="mb-0">The Garden Ballroom, Level 3</p>
        <div className={styles.rule} />
        <p className="mb-1">With gratitude,</p>
        <p className={styles.signature}>Alex Lim & Sam Ong</p>
      </div>
    </Frame>
  );
}

function RsvpMock() {
  return (
    <div className="d-grid gap-3">
      <Frame url="wedo.example/rsvp/K7QM4PXR">
        <div className={styles.screen}>
          <p className={`${styles.tiny} ${styles.center} mb-1`}>Kindly reply</p>
          <p className={`${styles.display} ${styles.center} fs-4 mb-1 lh-sm`}>
            Will you join us?
          </p>
          <p className={`${styles.small} ${styles.center} mb-3`}>
            Please respond by <b>Saturday, 31 October 2026</b>.
          </p>
          {[
            ["Jordan Tan", true],
            ["Mei Tan", true],
            ["Kai Tan", false],
          ].map(([name, accepts]) => (
            <div className={styles.guestRow} key={String(name)}>
              <span className={styles.guestName}>{name}</span>
              <span className={styles.choices}>
                <span className={accepts ? styles.choiceOn : styles.choice}>
                  Accepts
                </span>
                <span className={accepts ? styles.choice : styles.choiceOn}>
                  Declines
                </span>
              </span>
            </div>
          ))}
          <div className={styles.field}>Can’t wait to celebrate with you!</div>
          <span className={styles.mockBtn}>Send RSVP</span>
        </div>
      </Frame>
      <Frame url="Slack · #rsvps">
        <div className={`${styles.screen} ${styles.slack}`}>
          <p className="mb-2">
            🙌 <code className={styles.code}>K7QM4PXR</code> has responded
          </p>
          <p className="mb-1 fw-semibold">Guests</p>
          <p className="mb-2">✅ Jordan ✅ Mei ❌ Kai</p>
          <pre className={styles.slackQuote}>
            Can’t wait to celebrate with you!
          </pre>
        </div>
      </Frame>
    </div>
  );
}

function CardMock({ qr, code }: { qr: string; code: string }) {
  return (
    <Frame url="wedo.example/god/invites/K7QM4PXR">
      <div className={styles.cardStage}>
        <div className={styles.card}>
          <span className={styles.tiny}>Together with their families</span>
          <p className={`${styles.signature} mt-2`}>Alex & Sam</p>
          <p className="mt-2 mb-0">request the pleasure of the company of</p>
          <p className="mt-2 fw-semibold">Mr. & Mrs. Jordan Tan, Family</p>
          <div className={styles.cardBottom}>
            <div>
              <div className={styles.small}>Invite code</div>
              <div className={styles.cardCode}>{code}</div>
              <div className={`${styles.small} mt-1`}>RSVP by 31 Oct</div>
            </div>
            <Image
              src={qr}
              alt="QR code linking to the RSVP page"
              width={72}
              height={72}
              className={styles.qr}
              unoptimized
            />
          </div>
        </div>
      </div>
    </Frame>
  );
}

const STATS = [
  ["Attending", "86", "of 120 guests"],
  ["Declined", "14", ""],
  ["Awaiting reply", "20", ""],
  ["Checked in", "0", ""],
];

const TABLES = [
  { name: "1", seated: 10, max: 10, vip: true },
  { name: "2", seated: 9, max: 10, vip: true },
  { name: "3", seated: 10, max: 10, vip: false },
  { name: "4", seated: 7, max: 10, vip: false },
  { name: "5", seated: 8, max: 10, vip: false },
  { name: "6", seated: 4, max: 10, vip: false },
];

function GuestsMock() {
  return (
    <Frame url="wedo.example/god">
      <div className={styles.screen}>
        <div className={styles.stats}>
          {STATS.map(([label, value, note]) => (
            <div className={styles.stat} key={label}>
              <div className={styles.small}>{label}</div>
              <div className={styles.statValue}>{value}</div>
              {note && <div className={styles.small}>{note}</div>}
            </div>
          ))}
        </div>
        <div className={styles.tables}>
          {TABLES.map((t) => (
            <div
              key={t.name}
              className={`${styles.table} ${t.vip ? styles.tableVip : ""}`}
            >
              <div className={styles.small}>
                Table {t.name}
                {t.vip ? " · VIP" : ""}
              </div>
              <div>
                {t.seated}/{t.max}
              </div>
              <div className={styles.meter}>
                <span style={{ width: `${(t.seated / t.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function CheckinMock() {
  return (
    <div className={styles.phone}>
      <Frame url="wedo.example/checkin">
        <div className={`${styles.screen} ${styles.center}`}>
          <p className="fw-semibold mb-1">Welcome!</p>
          <p className={`${styles.small} mb-0`}>
            Please find your table assignments below
          </p>
          <div className={styles.list}>
            <div className={styles.listItemOn}>Mr. Jordan Tan (Table 4) 🌺</div>
            <div className={styles.listItemOn}>Mrs. Mei Tan (Table 4)</div>
          </div>
          <span className={styles.mockBtn}>✅ Check In (2)</span>
          <p className={`${styles.small} mt-3 mb-1`}>
            We hope you have a splendid time!
          </p>
          <p className={styles.signature}>Alex & Sam</p>
        </div>
      </Frame>
    </div>
  );
}

function ThemesMock() {
  return (
    <div className={styles.themes}>
      {THEMES.map((theme) => (
        <div className={styles.swatch} data-theme={theme} key={theme}>
          <div className={styles.swatchCover}>
            <p className={`${styles.tiny} mb-0`}>We’re getting married</p>
            <p className={`${styles.display} ${styles.swatchNames}`}>
              Alex & Sam
            </p>
            <span className={styles.swatchBtn}>RSVP</span>
          </div>
          <div className={styles.swatchLabel}>{theme}</div>
        </div>
      ))}
    </div>
  );
}

function ThankYouMock() {
  return (
    <Frame url="wedo.example/thank-you">
      <div className={styles.cover}>
        <p className={styles.tiny}>Thank you</p>
        <p className={`${styles.display} ${styles.coverNames}`}>Alex & Sam</p>
        <p className={styles.coverLine}>Saturday, 14 November 2026</p>
      </div>
      <div className={styles.screen}>
        <p className="mb-2">
          Thank you for celebrating with us. Here are a few of our favourite
          moments from the day.
        </p>
        <p className={`${styles.tiny} ${styles.center} mt-3 mb-0`}>Memories</p>
        <div className={styles.photos} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span className={styles.photo} key={i} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function SecurityMock() {
  return (
    <Frame url="app/rsvp/actions.ts — abridged">
      <pre className={styles.terminal}>
        <span className={styles.comment}>
          {"// Each step returns a generic error to the guest.\n"}
        </span>
        {`submissionSchema.safeParse(input)
await verifyHCaptcha(captcha)  `}
        <span className={styles.comment}>{"// fails closed"}</span>
        {`
isRsvpClosed(invite.respondBy, invite.event.startTime, timeZone)
planRsvp(inviteGuestIds, { attending, guestIds })
`}
        <span className={styles.comment}>
          {"// ↳ rejects guest ids from other invites\n\n"}
        </span>
        <span className={styles.comment}>
          {"// app/god/guests/export/route.ts\n"}
        </span>
        {'await requireAdmin("/god/guests");'}
      </pre>
    </Frame>
  );
}

export default async function AboutPage() {
  // Read settings per request so a changed demo code shows without a redeploy.
  await connection();
  const [settings, baseUrl] = await Promise.all([getSettings(), siteUrl()]);
  const demoCode = settings.demoInviteCode
    ? normalizeInviteCode(settings.demoInviteCode)
    : "";
  const demoPath = /^[A-Z0-9]{6,32}$/.test(demoCode)
    ? `/rsvp/${encodeURIComponent(demoCode)}`
    : null;
  // The card's QR is real: scanning it opens the demo invite when one is configured.
  const qr = await QRCode.toDataURL(`${baseUrl}${demoPath ?? "/"}`, {
    margin: 0,
    width: 216,
    color: { dark: "#2a2521", light: "#ffffff" },
  });

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroText}>
            <p className="eyebrow">Open source · Archived</p>
            <h1 className={styles.display}>
              From the printed card to the door, one code per household.
            </h1>
            <p className={styles.lede}>
              WeDo is a wedding website with invitations, RSVPs, seating and
              check-in built in. Each household gets a code on its printed card.
              Guests scan it to reply for everyone on the invite, the couple
              seats them at tables, and the same code checks them in on the day.
            </p>
            <div className={styles.ctas}>
              {demoPath ? (
                <Link href={demoPath} className="btn btn-primary btn-lg">
                  Try the guest RSVP
                </Link>
              ) : (
                <Link href="/" className="btn btn-primary btn-lg">
                  See the guest site
                </Link>
              )}
              <a
                href={SOURCE_URL}
                className="btn btn-secondary btn-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source on GitHub
              </a>
            </div>
            {demoPath && (
              <p className={styles.note}>
                The demo invite and its guests are fictional.
              </p>
            )}
          </div>
          <figure className={styles.heroFigure}>
            <InviteMock />
            <figcaption className={styles.caption}>
              An invite page — the cover, then a letter addressed to the
              household.
            </figcaption>
          </figure>
        </div>
      </section>

      <Feature
        eyebrow="Invites"
        title="A code on every card, and a card for every household."
        body={[
          "Each invite groups the guests of one household under a random code. The admin page renders a printable card for it: the template background, a formal addressee line, the code, the reply-by date and a QR code that opens that invite’s page.",
          "The same page suggests the message to send alongside it, so invites can go out by post, by chat app, or both.",
        ]}
        bullets={[
          "Codes use an unambiguous 31-character alphabet and a secure random source.",
          "Addressee lines follow salutations: “Mr. & Mrs. Jordan Tan, Family”.",
          "Card backgrounds are uploaded in settings; a plain card is drawn without one.",
        ]}
        figure={<CardMock qr={qr} code={demoPath ? demoCode : "K7QM4PXR"} />}
        caption={
          demoPath
            ? "A printable card. This QR code opens the demo invite."
            : "A printable card — addressee, code, reply-by date and QR link."
        }
      />

      <Feature
        eyebrow="RSVP"
        title="Guests reply for everyone on their invite."
        body={[
          "The invite page greets the household by name, then lists its guests with Accepts and Declines beside each. One person answers for all of them, leaves a note for the couple and sends it.",
          "Replies can be changed until the reply-by date, which closes at the end of that day in the event’s time zone rather than the guest’s. Guests see only their own invite: no phone numbers, emails or tables.",
        ]}
        bullets={[
          "Every reply is checked on the server: captcha, deadline, and that each guest belongs to that invite.",
          "New replies can post to a Slack channel.",
          "The agreement, change policy and Q&A are written in Markdown by the couple.",
        ]}
        figure={<RsvpMock />}
        caption="The reply form for a three-person invite, and the couple’s Slack notification."
        reverse
      />

      <Feature
        eyebrow="Guests & seating"
        title="Replies, tables and the venue’s seating chart in one place."
        body={[
          "The dashboard counts who is attending, who has declined and who has yet to reply, and how many have checked in. Guests are assigned to tables from the guest list, which shows each table’s assigned and attending guests against its capacity.",
          "When the plan is settled, it exports as a seating-chart CSV for the venue.",
        ]}
        bullets={[
          "VIP tables are marked; children and corsage recipients are flagged per guest.",
          "Counts update as replies come in.",
          "The wedding date and venue are edited in settings, with a countdown on the dashboard.",
        ]}
        figure={<GuestsMock />}
        caption="The dashboard’s reply counts, then tables against capacity."
      />

      <Feature
        eyebrow="Check-in"
        title="At the door, by code, name or QR scan."
        body={[
          "The check-in page runs on a phone or tablet at the reception table. Ushers scan the guest’s card or type a code or name, and the invite’s attending guests appear with their tables. Tapping who has arrived checks them in.",
          "Once checked in, the guest sees a thank-you from the couple and, if one is set, a gift QR code.",
        ]}
        bullets={[
          "Check-in remembers who has already arrived.",
          "Search by name suggests matching guests when the card is left at home.",
          "If saving fails, the page says so, so the desk can note it by hand.",
        ]}
        figure={<CheckinMock />}
        caption="Check-in for one invite — tables shown, two guests selected."
        reverse
      />

      <Feature
        eyebrow="Look & content"
        title="Four looks, and nothing about the wedding in the code."
        body={[
          "The site comes in four presets — classic, modern, garden and blush — each with its own type and palette, and an optional accent colour. Names, copy, the Q&A and every photo are edited in settings and stored in the database and Vercel Blob.",
          "That keeps the repository free of anyone’s photos, contact details or payment codes, so it can be forked as it is.",
        ]}
        bullets={[
          "Photos are resized in the browser before upload, so camera images fit.",
          "Uploaded images are type- and size-checked on the server.",
          "A test fails the build if photos or phone numbers are committed.",
        ]}
        figure={<ThemesMock />}
        caption="The four presets. This page follows whichever one the site uses."
      />

      <Feature
        eyebrow="After the day"
        title="The site turns into a thank-you page."
        body={[
          "Once the wedding date has passed, the home page becomes a note from the couple with a photo gallery. Tapping a photo opens a full-screen viewer with swipe and arrow-key navigation, and a link can point to the full album.",
          "The switch can be turned off, in which case the original site stays up and links to the thank-you page instead.",
        ]}
        bullets={[
          "The note is written in Markdown in settings.",
          "Gallery photos upload like cover photos and are served at sized resolutions.",
          "Section links drop out of the navigation on the thank-you page.",
        ]}
        figure={<ThankYouMock />}
        caption="The thank-you page — the couple’s note, then the gallery."
        reverse
      />

      <Feature
        eyebrow="Protection"
        title="An invite code opens one invite, and nothing more."
        body={[
          "Guest pages load only the fields a guest needs, and every Server Action validates its input before touching the database. Admin access is checked by each page, action and route itself rather than by a shared layout.",
          "Sign-in uses Auth0, and admin access can be limited to a list of verified email addresses.",
        ]}
        bullets={[
          "Input is validated with zod; errors returned to guests are generic.",
          "Admin Markdown renders without raw HTML, and links and images must be https.",
          "Check-in also verifies that each guest belongs to the scanned invite.",
        ]}
        figure={<SecurityMock />}
        caption="The checks behind every reply, in outline."
      />

      <section className={styles.closing}>
        <div className={styles.wrap}>
          <p className="eyebrow">Archived</p>
          <h2 className={styles.display}>
            Built for one wedding, kept for anyone who wants it.
          </h2>
          <p>
            WeDo was written in 2022 for a wedding in Singapore, where family
            ran the check-in desk with it on the day. In 2026 it was rebuilt on
            Next.js 16, React 19 and Prisma 7, redesigned, and made safe to
            fork. It is not a hosted service: there is no sign-up, and nothing
            is sold. To use it, fork the repository and deploy your own copy.
          </p>
          <div className={styles.ctas}>
            <a
              href={SOURCE_URL}
              className="btn btn-primary btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fork on GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <span>WeDo · © WuCoLaBo · MIT licence</span>
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
            Source
          </a>
        </div>
      </footer>
    </div>
  );
}
