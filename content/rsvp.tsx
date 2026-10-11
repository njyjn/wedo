// Event-specific copy for the invite letter and RSVP form. Edit to suit your event.

export const DEFAULT_INVITE_MESSAGE =
  "We look forward to seeing you on our very special day! Kindly RSVP below. Thank you.";

export function VaccinationNotice() {
  return (
    <>
      Kindly note that you are required to be fully vaccinated to attend the
      event according to current VDS regulations.
    </>
  );
}

export function AgreementLabel() {
  return (
    <>
      I/my guests and I agree to be subject to all prevailing COVID-19 measures
      laid out by the authorities, including abiding by VDS entry requirements
      and adhering to all safe management measures. Please click{" "}
      <a
        href="https://www.gobusiness.gov.sg/covid-19-faqs/for-sector-specific-queries/marriage-solemnizations-and-receptions"
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>{" "}
      for the latest government regulations.
    </>
  );
}

export function ChangePolicy() {
  return (
    <>
      You may make changes to your response at any time before the RSVP
      deadline. If there are any changes to your response after this date,
      please contact the couple (WhatsApp: +65 [phone removed]), Justin (+65 9655
      6795) or Alethea (+65 [phone removed]). This form will not be accessible after
      the stipulated deadline. Thank you for your understanding.
    </>
  );
}
