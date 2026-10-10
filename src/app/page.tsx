"use client";

import Link from "next/link";
import JtsInstallButton from "@/app/jts-install-button";

const services = [
  { name: "Pixie cut", price: "P350–P400", note: "A shaped, precision short cut.", tag: "THE CUT" },
  { name: "Cut + pixie cut", price: "P200", note: "A clean cut with a considered finish.", tag: "THE SHAPE" },
  { name: "Pure white", price: "P300", note: "Bleach and colour for a high-impact finish.", tag: "THE COLOUR" },
  { name: "Cut + bleach", price: "P250", note: "A cut paired with a bleach service.", tag: "THE CHANGE" },
];

function Logo() {
  return <Link href="/" className="jtsEditLogo" aria-label="JTS Styles home">
    <span className="jtsEditLogoMark">J<span>.</span></span>
    <span className="jtsEditLogoWords"><b>JTS STYLES</b><small>JOHN THE STYLIST BW</small></span>
  </Link>;
}

export default function Home() {
  return <main className="jtsSite jtsEditorialHome">
    <div className="jtsEditTopline">
      <div className="jtsEditContainer">
        <span>GABORONE, BOTSWANA</span>
        <span>PERSONAL STYLE · BY APPOINTMENT</span>
        <a href="https://wa.me/26778053564">WHATSAPP JOHN ↗</a>
      </div>
    </div>

    <header className="jtsEditHeader">
      <div className="jtsEditContainer jtsEditHeaderInner">
        <Logo />
        <nav aria-label="Main navigation">
          <a href="#services">The services</a>
          <a href="#booking">Your appointment</a>
          <a href="#visit">Find John</a>
        </nav>
        <div className="jtsEditHeaderActions">
          <Link href="/account" className="jtsEditTextLink">My bookings ↗</Link>
          <Link href="/order" className="jtsEditBookButton">Book a look <span>↗</span></Link>
        </div>
      </div>
    </header>

    <section className="jtsEditHero">
      <div className="jtsEditContainer jtsEditHeroGrid">
        <div className="jtsEditHeroCopy">
          <span className="jtsEditEyebrow"><i /> JTS STYLES · G WEST</span>
          <h1>Your look.<br />Your <em>signature.</em></h1>
          <p>Precision cuts, bleach, colour and statement styles by John The Stylist Bw. Bring the idea. Let’s plan the look.</p>
          <div className="jtsEditHeroActions">
            <Link href="/order" className="jtsEditPrimary">Plan your appointment <span>↗</span></Link>
            <a href="#services" className="jtsEditSecondary">Explore the services <span>↓</span></a>
          </div>
          <div className="jtsEditFacts" aria-label="Appointment essentials">
            <div><b>01 DAY</b><span>Minimum notice</span></div>
            <div><b>50%</b><span>Deposit to secure</span></div>
            <div><b>08–18</b><span>Appointment hours</span></div>
          </div>
        </div>
        <div className="jtsEditHeroArt" aria-label="JTS Styles visual identity">
          <div className="jtsEditArtTop"><span>THE PERSONAL EDIT</span><span>BW / 001</span></div>
          <div className="jtsEditArtCircle"><span>J</span><i>✳</i></div>
          <div className="jtsEditArtType"><span>STYLE</span><em>IS</em><span>PERSONAL.</span></div>
          <div className="jtsEditArtSide">CUT · COLOUR · CHARACTER · CUT · COLOUR · CHARACTER ·</div>
          <div className="jtsEditArtBottom"><span>JOHN THE STYLIST BW</span><span>GABORONE, BOTSWANA</span></div>
        </div>
      </div>
      <div className="jtsEditTicker" aria-hidden="true"><div>CUT <i>✳</i> COLOUR <i>✳</i> BLEACH <i>✳</i> BARBERING <i>✳</i> STATEMENT STYLE <i>✳</i> CUT <i>✳</i> COLOUR <i>✳</i> BLEACH <i>✳</i></div></div>
    </section>

    <section id="services" className="jtsEditServices">
      <div className="jtsEditContainer">
        <div className="jtsEditSectionHead">
          <div><span className="jtsEditEyebrow">01 / THE SERVICE EDIT</span><h2>Choose the <em>starting point.</em></h2></div>
          <p>Clear prices for the listed services. Have another look in mind? Ask John before booking.</p>
        </div>
        <div className="jtsEditServiceGrid">
          {services.map((service, index) => <article className="jtsEditServiceCard" key={service.name}>
            <div className="jtsEditServiceCardTop"><span>{service.tag}</span><span>0{index + 1}</span></div>
            <div className={"jtsEditServiceGlyph jtsEditServiceGlyph" + index}><span>{["J", "S", "C", "↗"][index]}</span></div>
            <h3>{service.name}</h3>
            <p>{service.note}</p>
            <div className="jtsEditServiceFoot"><strong>{service.price}</strong><Link href={"/order?service=" + encodeURIComponent(service.name)}>Choose service <span>↗</span></Link></div>
          </article>)}
        </div>
        <div className="jtsEditAskBand">
          <div><span>YOUR IDEA ISN’T LISTED?</span><strong>Fades, bobs, tinting or a special-event look?</strong><p>Ask about the style and price before you commit. No made-up catalogue prices.</p></div>
          <a href="https://wa.me/26778053564?text=Hi%20John%2C%20I%27d%20like%20to%20ask%20about%20a%20hairstyle%20and%20price." target="_blank" rel="noreferrer">Ask John on WhatsApp <span>↗</span></a>
        </div>
      </div>
    </section>

    <section id="booking" className="jtsEditBooking">
      <div className="jtsEditContainer">
        <div className="jtsEditSectionHead jtsEditBookingHead">
          <div><span className="jtsEditEyebrow">02 / THE APPOINTMENT</span><h2>Good style.<br /><em>No guesswork.</em></h2></div>
          <p>A straightforward request, with the important details clear before you send anything.</p>
        </div>
        <div className="jtsEditBookingGrid">
          <article><span>01</span><div><h3>Choose your service</h3><p>Start with the listed look that fits. Add notes to describe what you have in mind.</p></div></article>
          <article><span>02</span><div><h3>Request a time</h3><p>Choose a date at least one day ahead, between 08:00 and 18:00. John still needs to confirm the slot.</p></div></article>
          <article><span>03</span><div><h3>Secure your spot</h3><p>A 50% deposit is required. Pay via Orange Money only after you have checked the details and follow the booking instructions.</p></div></article>
        </div>
        <div className="jtsEditPaymentBar">
          <div><span>ORANGE MONEY · DEPOSIT DETAILS</span><strong>75720306</strong><small>Account name: John SHUMBA</small></div>
          <p><b>Important:</b> submitting a request does not confirm the appointment or mean a deposit has been received. Your booking is secured when John confirms the slot and deposit.</p>
          <Link href="/order" className="jtsEditPrimary">Start a booking <span>↗</span></Link>
        </div>
      </div>
    </section>

    <section id="visit" className="jtsEditVisit">
      <div className="jtsEditContainer jtsEditVisitGrid">
        <div className="jtsEditVisitCopy">
          <span className="jtsEditEyebrow">03 / COME THROUGH</span>
          <h2>G West.<br /><em>Find the purple door.</em></h2>
          <p>G West shops, upstairs at Star Tattoos parlor and boutique, inside the salon with the purple door labelled “miss Emma”.</p>
          <div className="jtsEditVisitActions">
            <a href="https://www.google.com/maps/search/?api=1&query=Star+Tattoos+G+West+Gaborone+Botswana" target="_blank" rel="noreferrer" className="jtsEditPrimary">Find the location <span>↗</span></a>
            <a href="tel:+26778053564" className="jtsEditPhone">+267 78 053 564</a>
          </div>
        </div>
        <aside className="jtsEditVisitCard">
          <div className="jtsEditVisitCardTop"><span>JTS STYLES</span><span>GABORONE / BW</span></div>
          <div className="jtsEditDoor"><span>J</span><b>MISS EMMA</b><small>UPSTAIRS · G WEST SHOPS</small></div>
          <div className="jtsEditHours"><span>APPOINTMENT HOURS</span><strong>08:00 — 18:00</strong><small>Book at least one day ahead</small></div>
        </aside>
      </div>
    </section>

    <section className="jtsEditKeep">
      <div className="jtsEditContainer jtsEditKeepInner">
        <div className="jtsEditKeepMark">J<span>.</span></div>
        <div className="jtsEditKeepCopy"><span className="jtsEditEyebrow">KEEP JTS CLOSE</span><h2>Your next appointment,<br /><em>one tap away.</em></h2><p>Optionally add JTS Styles to your home screen for quicker access to booking, your appointment history and John’s contact details. You can book without installing anything.</p></div>
        <div className="jtsEditKeepAction"><JtsInstallButton /><small>Optional · no install needed to book</small></div>
      </div>
    </section>

    <footer className="jtsEditFooter">
      <div className="jtsEditContainer">
        <div className="jtsEditFooterMain"><Logo /><p>Beauty · Colour · Cuts · Barbering<br />Gaborone, Botswana</p><Link href="/order" className="jtsEditPrimary">Book your look <span>↗</span></Link></div>
        <div className="jtsEditFooterBottom"><span>© JTS STYLES · JOHN THE STYLIST BW</span><div><Link href="/account">My bookings</Link><a href="https://wa.me/26778053564">WhatsApp</a><a href="tel:+26778053564">Call John</a><Link href="/admin">Admin</Link></div></div>
      </div>
    </footer>
    <div className="jtsMobileCta jtsEditMobileCta"><Link href="/order" className="jtsEditPrimary">Book your appointment <span>↗</span></Link></div>
  </main>;
}
