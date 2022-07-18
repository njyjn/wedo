import Image from "next/image";
import { Row } from "react-bootstrap";

export const Faq: React.FC<{ hidden?: boolean }> = ({ hidden = false }) => {
  return (
    <div className="faq-layout">
      <Row hidden={hidden}>
        <h4 className="center">Frequently Asked Questions</h4>
        <b>What time should I arrive?</b>
        <div className="my-3 center">
          <table className="timetable">
            <thead>
              <tr>
                <th>Solemnization</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Registration</td>
                <td>from 6:00pm</td>
              </tr>
              <tr>
                <td>Seated</td>
                <td>by 6:15pm</td>
              </tr>
              <tr>
                <td>Door closes</td>
                <td>6:25pm</td>
              </tr>
              <tr>
                <td>Start</td>
                <td>6:30pm</td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th>Dinner</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Registration</td>
                <td>from 7:00pm</td>
              </tr>
              <tr>
                <td>Seated</td>
                <td>by 7:20pm</td>
              </tr>
              <tr>
                <td>Dinner served</td>
                <td>7:30pm</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Both events are held at the William Pickering Ballroom on Level 2.
        </p>
        <p>F&amp;B will not be served during the solemnization ceremony.</p>
        <b>What is the dress code?</b>
        <p>Smart.</p>
        <b>When do I have to RSVP by?</b>
        <p>Please RSVP according to the deadline given in your invitation.</p>
        <b>Do I need to be vaccinated to attend?</b>
        <p>
          Vaccination against or recovery from COVID-19 is required according to
          the latest VDS measures{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.gobusiness.gov.sg/covid-19-faqs/for-sector-specific-queries/marriage-solemnizations-and-receptions"
          >
            described here
          </a>{" "}
          (subject to change). Furthermore, for the safety of all guests,
          especially the elderly and immunocompromised in attendance, please
          stay home if you are feeling unwell on the day of the event. We seek
          all invitees&apos; understanding and cooperation on this matter.
        </p>
        <b>How do I get here?</b>
        <p>
          PARKROYAL COLLECTION Pickering is a minute&apos;s walk from Chinatown
          MRT Station, Exit E (towards Chinatown Point Shopping Centre). Parking
          is complementary for all guests{" "}
          <b>on a first-come first-served basis</b>. Please come early to claim
          a parking ticket at the registration desk.
        </p>
        <p className="center">
          <iframe
            className="map"
            loading="lazy"
            style={{ border: 0 }}
            allowFullScreen={false}
            src={`https://www.google.com/maps/embed/v1/view?zoom=17&center=1.2858%2C103.8461&key=${process.env.GOOGLE_MAPS_API_KEY}`}
          ></iframe>
        </p>
        <b>How can I bless the couple?</b>
        <p>
          To make the process simpler you may scan the PayNow QR code below in
          advance or drop your gift at the registration desk on that day. Thank
          you for your generosity!
        </p>
        <p className="center">
          <Image alt="paynow qr" src="/qr.png" height="150" width="150"></Image>
        </p>
        <b>Will the event be made available on Zoom?</b>
        <p>The event will not be broadcasted.</p>
        <b>Who can I contact for questions?</b>
        <p>
          Please contact the couple (WhatsApp: +65 8044 2624) / Justin Ng (+65
          9655 6795) / Alethea Sim (+65 8383 4264).
        </p>
      </Row>
    </div>
  );
};
