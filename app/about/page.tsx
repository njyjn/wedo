import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import QRCode from "qrcode";
import { normalizeInviteCode } from "@/lib/invite-code";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";
import styles from "./about.module.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});
const mono = IBM_Plex_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const SOURCE_URL = "https://github.com/njyjn/wedo";

export const metadata: Metadata = {
  title: "About",
  description:
    "An open-source wedding invite, RSVP, seating and check-in app: one code per household, from the printed card to the door.",
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
  id,
  eyebrow,
  title,
  body,
  bullets,
  figure,
  caption,
  reverse = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  bullets: string[];
  figure: React.ReactNode;
  caption: string;
  reverse?: boolean;
}) {
  return (
    <section id={id} className={styles.section}>
      <div
        className={`${styles.wrap} ${styles.grid} ${reverse ? styles.reverse : ""}`}
      >
        <div className={styles.text}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.serif}>{title}</h2>
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

// The mockups below use fictional guests and are drawn in HTML: the repository ships no
// screenshots (see tests/repo-hygiene.test.ts).

function RsvpMock() {
  return (
    <Frame url="wedo.example/rsvp/K7QM4PXR">
      <div className={`${styles.screen} ${styles.rsvpGrid}`}>
        <div className={styles.cover} aria-hidden="true" />
        <div>
          <p className={`${styles.signature} ${styles.center}`}>Alex & Sam</p>
          <p className={`${styles.small} ${styles.center} mt-2 mb-3`}>
            Saturday, 14 November · 7pm
            <br />
            The Garden Ballroom
          </p>
          <div className={styles.small}>Attending (2)</div>
          {[
            ["Jordan Tan", true],
            ["Mei Tan", true],
            ["Kai Tan", false],
          ].map(([name, on]) => (
            <div className={styles.check} key={String(name)}>
              <span className={on ? styles.boxOn : styles.box} />
              {name}
            </div>
          ))}
          <div className={styles.field}>Can’t wait to celebrate with you!</div>
          <p className={`${styles.small} mt-2 mb-0`}>
            You can change your response until 31 October.
          </p>
          <span className={styles.mockBtn}>Attending</span>
          <span className={styles.mockBtnRed}>Unable to Attend</span>
        </div>
      </div>
    </Frame>
  );
}

function CardMock({ qr, code }: { qr: string; code: string }) {
  return (
    <Frame url="wedo.example/god/invites/K7QM4PXR">
      <div className={styles.cardStage}>
        <div className={styles.card}>
          <span className={styles.eyebrow}>Together with their families</span>
          <p className={`${styles.signature} mt-2`}>Alex & Sam</p>
          <p className="mt-2 mb-0">request the pleasure of the company of</p>
          <p className="mt-2 fw-semibold">Mr. & Mrs. Jordan Tan, Family</p>
          <div className={styles.cardBottom}>
            <div>
              <div className={styles.small}>Invite code</div>
              <div className={styles.code}>{code}</div>
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

const TABLES = [
  { name: "1", seated: 10, max: 10, vip: true },
  { name: "2", seated: 9, max: 10, vip: true },
  { name: "3", seated: 10, max: 10, vip: false },
  { name: "4", seated: 7, max: 10, vip: false },
  { name: "5", seated: 8, max: 10, vip: false },
  { name: "6", seated: 4, max: 10, vip: false },
];

function SeatingMock() {
  return (
    <Frame url="wedo.example/god/guests">
      <div className={styles.screen}>
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
        <table className={styles.rows}>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Invite</th>
              <th>Table</th>
              <th>RSVP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jordan Tan</td>
              <td>K7QM4PXR</td>
              <td>4</td>
              <td>Attending</td>
            </tr>
            <tr>
              <td>Mei Tan</td>
              <td>K7QM4PXR</td>
              <td>4</td>
              <td>Attending</td>
            </tr>
            <tr className={styles.shaded}>
              <td>Priya Raman</td>
              <td>W3HNC9TD</td>
              <td>5</td>
              <td>Attending</td>
            </tr>
            <tr className={styles.shaded}>
              <td>Daniel Lim</td>
              <td>R8VYF2LB</td>
              <td>5</td>
              <td>No reply</td>
            </tr>
          </tbody>
        </table>
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

const SETTINGS_MOCK = [
  ["Couple name", "text", "Alex & Sam"],
  ["Invitation message", "markdown", "We would love for you to join us…"],
  ["FAQ", "markdown", "| Dress code | Garden formal |"],
  ["Cover photos", "images", "3 uploaded"],
  ["Gift / payment QR code", "image", "1 uploaded"],
  ["Event time zone", "text", "Asia/Singapore"],
];

function SettingsMock() {
  return (
    <Frame url="wedo.example/god/settings">
      <div className={styles.screen}>
        {SETTINGS_MOCK.map(([label, kind, value]) => (
          <div className={styles.setting} key={label}>
            <div>
              {label}
              <span className={styles.kind}>{kind}</span>
            </div>
            <div className={styles.value}>{value}</div>
          </div>
        ))}
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

function ResponseMock() {
  return (
    <div className="d-grid gap-3">
      <Frame url="wedo.example/rsvp/K7QM4PXR">
        <div className={styles.screen}>
          <p className="fw-semibold mb-1">All set!</p>
          <p className={`${styles.small} mb-0`}>
            Thanks for your response. See you there!
          </p>
          <div className="d-flex gap-2 justify-content-end">
            <span className={styles.mockBtnLight}>Edit response</span>
            <span className={styles.mockBtnBlue}>Go to homepage</span>
          </div>
        </div>
      </Frame>
      <Frame url="Slack · #rsvps">
        <div className={styles.screen}>
          <p className="mb-2">
            🙌 <code className={styles.code}>K7QM4PXR</code> has responded
          </p>
          <p className={`${styles.small} mb-1`}>
            <b>Guests</b>
          </p>
          <p className="mb-2">✅ Jordan ✅ Mei ❌ Kai</p>
          <pre className={styles.slackQuote}>
            Can’t wait to celebrate with you!
          </pre>
        </div>
      </Frame>
    </div>
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
    color: { dark: "#1f1a17", light: "#ffffff" },
  });

  return (
    <main className={`${styles.page} ${display.variable} ${mono.variable}`}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Open source · Archived</p>
            <h1 className={styles.serif}>
              From the printed card to the door, one code per household.
            </h1>
            <p className={styles.lede}>
              WeDo is a small wedding app for invitations, RSVPs, seating and
              check-in. Each household gets a code on its printed card. Guests
              scan it to answer for everyone on the invite, the couple seats
              them at tables, and the same code checks them in on the day.
            </p>
            <div className={styles.ctas}>
              {demoPath ? (
                <Link href={demoPath} className={styles.btn}>
                  Try the guest RSVP
                </Link>
              ) : (
                <Link href="/" className={styles.btn}>
                  See the guest page
                </Link>
              )}
              <a
                href={SOURCE_URL}
                className={styles.btnGhost}
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
            <RsvpMock />
            <figcaption className={styles.caption}>
              The invite page — everyone on the invite, one response.
            </figcaption>
          </figure>
        </div>
      </section>

      <Feature
        id="invites"
        eyebrow="Invites"
        title="A code on every card, and a card for every household."
        body={[
          "Each invite groups the guests of one household under a random code. The admin page renders a printable card for it: the template background, a formal addressee line, the code, the reply-by date and a QR code that opens that invite’s RSVP page.",
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
        id="rsvp"
        eyebrow="RSVP"
        title="Guests answer for everyone on their invite."
        body={[
          "Opening the link or entering the code shows the invite’s guests and nothing else: no phone numbers, emails or tables. One person ticks who is coming, leaves a note for the couple and submits.",
          "Responses can be changed until the reply-by date, which closes at the end of that day in the event’s time zone rather than the guest’s.",
        ]}
        bullets={[
          "Every submission is checked on the server: captcha, deadline, and that each guest belongs to that invite.",
          "New responses can post to a Slack channel.",
          "The agreement, change policy and FAQ are written in Markdown by the couple.",
        ]}
        figure={<ResponseMock />}
        caption="What the guest sees after submitting, and what the couple sees in Slack."
        reverse
      />

      <Feature
        id="seating"
        eyebrow="Seating"
        title="Tables filled from the guest list, not a separate spreadsheet."
        body={[
          "Guests are assigned to tables from the guest list, which shows each table’s count of assigned and attending guests next to its capacity. VIP tables are marked, and rows shade by table so a printed list is easy to read.",
          "When the plan is settled, it exports as a seating-chart CSV for the venue.",
        ]}
        bullets={[
          "Children and corsage recipients are flagged per guest.",
          "Counts update as RSVPs come in.",
          "The export lists each table’s guests in name order.",
        ]}
        figure={<SeatingMock />}
        caption="Guest management — tables against capacity, then every guest."
      />

      <Feature
        id="checkin"
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
        id="settings"
        eyebrow="Settings"
        title="Nothing about a wedding lives in the code."
        body={[
          "Names, copy, the FAQ, the time zone and every image are edited in the admin settings page and stored in the database and Vercel Blob. A fresh deployment shows neutral placeholders until they are filled in.",
          "That keeps the repository free of anyone’s photos, contact details or payment codes, so it can be forked as it is.",
        ]}
        bullets={[
          "Text, Markdown, single-image and multi-image settings.",
          "Uploaded images are type- and size-checked on the server.",
          "A test fails the build if photos or phone numbers are committed.",
        ]}
        figure={<SettingsMock />}
        caption="Settings — each value with its kind."
      />

      <Feature
        id="security"
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
        caption="The checks behind every RSVP, in outline."
        reverse
      />

      <section className={styles.closing}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Archived</p>
          <h2 className={styles.serif}>
            Built for one wedding, kept for anyone who wants it.
          </h2>
          <p>
            WeDo was written in 2022 for its author’s wedding in Singapore,
            where family ran the check-in desk with it on the day. In 2026 it
            was rebuilt on Next.js 16, React 19 and Prisma 7 and made safe to
            fork. It is not a hosted service: there is no sign-up, and nothing
            is sold. To use it, fork the repository and deploy your own copy.
          </p>
          <div className={styles.ctas}>
            <a
              href={SOURCE_URL}
              className={styles.btn}
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
          <span>WeDo · MIT licence</span>
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
            Source
          </a>
        </div>
      </footer>
    </main>
  );
}
