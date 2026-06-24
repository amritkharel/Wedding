import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react";
import "./styles.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

const engagementConfig = {
  coupleNames: "Amrit & Bidhata",
  coupleFirst: "Amrit",
  coupleSecond: "Bidhata",
  eventName: "Engagement Party",
  shortNames: "A & B",
  engagementDate: "2026-09-06T18:00:00-05:00",
  engagementDateLabel: "Sep 06 2026",
  engagementDay: "06",
  engagementMonth: "Sept",
  engagementYear: "2026",
  engagementWeekday: "Sunday",
  engagementTimeLabel: "6:00 PM",
  nextEventDate: "",
  engagementVenue: "The Springs in Katy",
  engagementAddress: "4999 Buller Rd, Brookshire, TX 77423",
  engagementMapUrl:
    "https://www.google.com/maps/search/?api=1&query=The+Springs+in+Katy+4999+Buller+Rd+Brookshire+TX+77423",
  heroImage: asset("assets/couple/pond-kiss.jpg"),
  inviteImage: asset("assets/couple/garden-walk.jpg"),
  finalImage: asset("assets/couple/pond-kiss.jpg"),
  contactEmail: "hello@amritandbidhata.com",
  rsvpEndpoint: "",
  storyCards: [
    {
      chapter: "Chapter One",
      date: "February · Burleson County, Texas",
      title: "Where the warmth began",
      image: asset("assets/couple/texas-chapter.jpg"),
      text:
        "A late-afternoon smile in Texas — the kind of soft, ordinary moment that turned out to be the beginning of every chapter after it.",
    },
    {
      chapter: "Chapter Two",
      date: "March · Washington, D.C.",
      title: "Blue skies and bright laughter",
      image: asset("assets/couple/dc-chapter-one.jpg"),
      text:
        "The capital under a wide spring sky. Two people laughing into the sun, already writing the kind of story they hadn't quite named yet.",
    },
    {
      chapter: "Chapter Three",
      date: "March · The Tidal Basin",
      title: "Beneath the blossoms",
      image: asset("assets/couple/dc-chapter-two.jpg"),
      text:
        "Cherry blossoms fell like soft confetti. A photograph that needed no filter, because the world had already turned pink for them.",
    },
    {
      chapter: "Chapter Four",
      date: "April · The garden pond",
      title: "A quiet pause",
      image: asset("assets/couple/pond-kiss.jpg"),
      text:
        "Still water, still hearts, one quiet kiss by the pond — the chapter where the future began to feel close enough to touch.",
    },
    {
      chapter: "Chapter Five",
      date: "May · The rose walk",
      title: "Walking forward",
      image: asset("assets/couple/garden-walk.jpg"),
      text:
        "Hand in hand through the roses, the path opened toward a date everyone would gather for. Forever, but easier than it sounds.",
    },
  ],
  timeline: [
    {
      year: "Feb 2026",
      title: "Texas warmth",
      text: "A golden selfie from Burleson County opens the album — the beginning of an unforgettable year.",
    },
    {
      year: "Mar 2026",
      title: "D.C. spring",
      text: "Washington welcomes them with monuments, magnolias, and the kind of light that asks to be remembered.",
    },
    {
      year: "Apr 2026",
      title: "By the pond",
      text: "A quiet garden pause becomes the hero photo of this little love story.",
    },
    {
      year: "May 2026",
      title: "Through the roses",
      text: "A long walk through the rose garden — the moment forever stopped feeling far away.",
    },
    {
      year: "Sep 6, 2026",
      title: "Engagement day",
      text: "Family, blessings, and the first official word of forever, said out loud.",
    },
  ],
  moments: [
    {
      image: asset("assets/couple/pond-kiss.jpg"),
      title: "Garden stillness",
      place: "April · Garden pond",
    },
    {
      image: asset("assets/couple/garden-walk.jpg"),
      title: "Rose walk",
      place: "May · Rose garden",
    },
    {
      image: asset("assets/couple/dc-chapter-two.jpg"),
      title: "Blossom day",
      place: "March · Washington, D.C.",
    },
    {
      image: asset("assets/couple/potomac-chapter.jpg"),
      title: "Temple morning",
      place: "Potomac, Maryland",
    },
    {
      image: asset("assets/couple/dc-chapter-one.jpg"),
      title: "Bright skies",
      place: "March · D.C.",
    },
    {
      image: asset("assets/couple/texas-chapter.jpg"),
      title: "Texas warmth",
      place: "February · Burleson County",
    },
    {
      image: asset("assets/couple/bethesda-chapter.jpg"),
      title: "Everyday us",
      place: "Everyday · Bethesda, Maryland",
    },
  ],
};

const sampleGuests = [
  { id: "aarav-patel", name: "Aarav Patel", partySize: 2, group: "Family" },
  { id: "meera-shah", name: "Meera Shah", partySize: 4, group: "Friends" },
  { id: "rao-family", name: "The Rao Family", partySize: 5, group: "Family" },
];

/* ============================================================
   Helpers
   ============================================================ */

function encodeInvite(guest) {
  const payload = JSON.stringify({
    name: guest.name.trim(),
    partySize: Number(guest.partySize) || 1,
    group: guest.group?.trim() || "Guest",
    id:
      guest.id ||
      `${guest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()
        .toString(36)
        .slice(-5)}`,
  });

  return btoa(unescape(encodeURIComponent(payload)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeInvite(token) {
  if (!token) return null;
  try {
    const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch {
    return null;
  }
}

function getInviteToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get("g") || params.get("guest");
}

function getBasePath() {
  const path = window.location.pathname.replace(/\/$/, "");
  const routeNames = ["/invite", "/admin-invitations"];
  const routeIndex = Math.max(...routeNames.map((route) => path.lastIndexOf(route)));
  if (routeIndex >= 0) return path.slice(0, routeIndex);
  return path === "" ? "" : path;
}

function getInvitePath(guest) {
  return `${getBasePath()}/invite?g=${encodeInvite(guest)}`;
}

function getStoredResponses() {
  try {
    return JSON.parse(localStorage.getItem("engagement-rsvps") || "[]");
  } catch {
    return [];
  }
}

function setStoredResponses(responses) {
  localStorage.setItem("engagement-rsvps", JSON.stringify(responses));
}

function useCountdown() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    const engagement = new Date(engagementConfig.engagementDate);
    const nextEvent = engagementConfig.nextEventDate
      ? new Date(engagementConfig.nextEventDate)
      : null;
    const hasEngagementPassed = now >= engagement;
    const target = nextEvent && hasEngagementPassed ? nextEvent : engagement;
    const total = Math.max(0, target.getTime() - now.getTime());
    const seconds = Math.floor(total / 1000);

    return {
      targetLabel: nextEvent && hasEngagementPassed ? "Next celebration" : "Engagement",
      days: Math.floor(seconds / 86400),
      hours: Math.floor((seconds % 86400) / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60,
      targetDate: target,
    };
  }, [now]);
}

/* ============================================================
   App
   ============================================================ */

function App() {
  const isInvite = window.location.pathname.includes("/invite");
  const isAdmin = window.location.pathname.includes("/admin-invitations");

  if (isInvite) return <InvitePage />;
  if (isAdmin) return <AdminInvitationsPage />;
  return <HomePage />;
}

function HomePage() {
  const countdown = useCountdown();
  const [doorOpen, setDoorOpen] = useState(false);

  useEffect(() => {
    if (!doorOpen) {
      document.body.style.overflow = "hidden";
    } else {
      const timer = window.setTimeout(() => {
        document.body.style.overflow = "";
      }, 2200);
      return () => window.clearTimeout(timer);
    }
  }, [doorOpen]);

  return (
    <>
      <DoorOverlay
        open={doorOpen}
        onOpen={() => setDoorOpen(true)}
        mark="Together with our families"
      />
      <main>
        <SiteNav />
        <Hero countdown={countdown} />
        <MomentsGallery />
        <FinalSection countdown={countdown} />
        <Footer />
      </main>
    </>
  );
}

/* ============================================================
   Door overlay
   ============================================================ */

function DoorOverlay({ open, onOpen, mark, recipient }) {
  return (
    <div className={`door-overlay${open ? " open" : ""}`} aria-hidden={open}>
      <div className="door-frame">
        <div className="door-arch">
          <div className="door-panel left" />
          <div className="door-panel right" />
          <div className="door-light" />
          <div className="door-ribbon" aria-hidden="true">
            <span className="ribbon-band ribbon-band-left" />
            <span className="ribbon-band ribbon-band-right" />
            <span className="bow-loop bow-loop-left" />
            <span className="bow-loop bow-loop-right" />
            <span className="bow-tail bow-tail-left" />
            <span className="bow-tail bow-tail-right" />
            <span className="bow-knot" />
          </div>
          <div className="door-content">
            <p className="door-mark">{mark || "You are invited"}</p>
            <h1 className="door-title">
              Engagement Party
              <em>Invitation</em>
            </h1>
            <p className="door-couple">Amrit &amp; Bidhata</p>
            {recipient ? <p className="door-recipient">For {recipient}</p> : null}
            <div className="door-date">
              <strong>{engagementConfig.engagementDateLabel}</strong>
              <span>{engagementConfig.engagementWeekday}</span>
            </div>
          </div>
        </div>
        <button className="door-cta" onClick={onOpen} type="button">
          Open Invitation
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Nav
   ============================================================ */

function SiteNav() {
  return (
    <nav className="nav" aria-label="Main navigation">
      <a href="#home" className="brand">
        <span>Amrit</span>
        <span className="brand-heart">
          <Heart size={14} fill="currentColor" aria-hidden="true" />
        </span>
        <span>Bidhata</span>
      </a>
      <div className="nav-links">
        <a href="#moments">Moments</a>
      </div>
    </nav>
  );
}

/* ============================================================
   Hero
   ============================================================ */

function Hero({ countdown }) {
  return (
    <section className="hero" id="home">
      <div className="hero-grid">
        <div className="hero-card">
          <div className="floral floral-top-left" aria-hidden="true" />
          <div className="floral floral-bottom-right" aria-hidden="true" />

          <p className="eyebrow">Save the Date</p>
          <h1 className="hero-couple">
            {engagementConfig.coupleFirst}
            <br />
            <em>&amp;</em> {engagementConfig.coupleSecond}
          </h1>
          <div className="hero-line">
            <CalendarDays size={18} aria-hidden="true" />
            <span>{engagementConfig.engagementDateLabel}</span>
            <span className="dot" />
            <span>{engagementConfig.engagementTimeLabel}</span>
          </div>
          <Countdown countdown={countdown} />
        </div>

        <figure className="hero-photo-frame">
          <img src={engagementConfig.heroImage} alt="" />
        </figure>
      </div>
    </section>
  );
}

function Countdown({ countdown }) {
  const units = [
    ["Days", countdown.days],
    ["Hours", countdown.hours],
    ["Mins", countdown.minutes],
    ["Secs", countdown.seconds],
  ];

  return (
    <div className="countdown" aria-label={`${countdown.targetLabel} countdown`}>
      <p className="eyebrow" style={{ marginBottom: 14 }}>
        Counting down to forever
      </p>
      <div className="countdown-grid">
        {units.map(([label, value]) => (
          <div className="count-box" key={label}>
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Moments Gallery
   ============================================================ */

function MomentsGallery() {
  const [activeMoment, setActiveMoment] = useState(0);
  const active = engagementConfig.moments[activeMoment];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveMoment((index) => (index + 1) % engagementConfig.moments.length);
    }, 4600);
    return () => window.clearInterval(timer);
  }, []);

  const previousMoment = () =>
    setActiveMoment(
      (index) =>
        (index - 1 + engagementConfig.moments.length) %
        engagementConfig.moments.length,
    );
  const nextMoment = () =>
    setActiveMoment((index) => (index + 1) % engagementConfig.moments.length);

  return (
    <section className="section moments-section" id="moments">
      <div className="section-heading">
        <span className="script">Captured Moments</span>
        <h2>Our favorite little frames</h2>
        <p>
          A living album of the in-between — sunlight, blossoms, quiet streets,
          and the soft moments that brought us here.
        </p>
      </div>

      <div className="moments-carousel">
        <figure className="moment-feature" key={active.title}>
          <img src={active.image} alt={`${active.title} — ${active.place}`} />
          <figcaption>
            <span>{String(activeMoment + 1).padStart(2, "0")}</span>
            <h3>{active.title}</h3>
            <p>{active.place}</p>
          </figcaption>
        </figure>

        <div className="moment-controls" aria-label="Captured moment controls">
          <button
            className="icon-button"
            onClick={previousMoment}
            aria-label="Previous Moment"
            type="button"
          >
            <ChevronLeft size={21} aria-hidden="true" />
          </button>
          <div className="moment-dots" role="tablist" aria-label="Captured Moments">
            {engagementConfig.moments.map((moment, index) => (
              <button
                key={moment.title}
                className={index === activeMoment ? "is-active" : ""}
                onClick={() => setActiveMoment(index)}
                aria-label={`Show ${moment.title}`}
                aria-selected={index === activeMoment}
                role="tab"
                type="button"
              />
            ))}
          </div>
          <button
            className="icon-button"
            onClick={nextMoment}
            aria-label="Next Moment"
            type="button"
          >
            <ChevronRight size={21} aria-hidden="true" />
          </button>
        </div>

        <div className="moment-strip">
        {engagementConfig.moments.map((moment, index) => (
          <button
            className={`moment-thumb${index === activeMoment ? " is-active" : ""}`}
            key={moment.title}
            onClick={() => setActiveMoment(index)}
            type="button"
          >
            <img src={moment.image} alt={`${moment.title} — ${moment.place}`} />
            <span>
              <strong>{moment.title}</strong>
              {moment.place}
            </span>
          </button>
        ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Invitation Studio
   ============================================================ */

function AdminInvitationsPage() {
  const homePath = getBasePath() ? `${getBasePath()}/` : "/";

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="secondary-link" href={homePath}>
          <ChevronLeft size={16} aria-hidden="true" />
          Back to Website
        </a>
        <div>
          <span className="script">Private Tools</span>
          <h1>Invitation Manager</h1>
          <p>
            This page is hidden from the public navigation. Keep its URL private.
          </p>
        </div>
      </header>
      <InvitationStudio />
    </main>
  );
}

function InvitationStudio() {
  const [guests, setGuests] = useState(sampleGuests);
  const [guestForm, setGuestForm] = useState({
    name: "",
    partySize: "2",
    group: "Family",
  });
  const [responses, setResponses] = useState(() => getStoredResponses());

  useEffect(() => {
    const refresh = () => setResponses(getStoredResponses());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function addGuest(event) {
    event.preventDefault();
    if (!guestForm.name.trim()) return;
    setGuests((current) => [
      ...current,
      {
        id: `${guestForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
        name: guestForm.name.trim(),
        partySize: Number(guestForm.partySize) || 1,
        group: guestForm.group.trim() || "Guest",
      },
    ]);
    setGuestForm({ name: "", partySize: "2", group: guestForm.group });
  }

  function copyInvite(guest) {
    const url = `${window.location.origin}${getInvitePath(guest)}`;
    navigator.clipboard?.writeText(url);
  }

  function downloadCsv() {
    const header = [
      "guestName",
      "attending",
      "guestCount",
      "message",
      "submittedAt",
    ];
    const rows = responses.map((response) =>
      header
        .map((key) => `"${String(response[key] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "engagement-rsvps.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <section className="section invite-studio">
      <div className="section-heading">
        <span className="script">Invitations</span>
        <h2>Make each RSVP personal</h2>
        <p>
          Generate a private link for every family or friend. Each invite opens
          to a beautiful page with their name and their own RSVP form.
        </p>
      </div>

      <div className="studio-grid">
        <form className="guest-form" onSubmit={addGuest}>
          <h3>Add a guest</h3>
          <label>
            Name
            <input
              value={guestForm.name}
              onChange={(event) =>
                setGuestForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="The Patel Family"
            />
          </label>
          <label>
            Suggested Party Size
            <input
              type="number"
              min="1"
              value={guestForm.partySize}
              onChange={(event) =>
                setGuestForm((current) => ({
                  ...current,
                  partySize: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Group
            <input
              value={guestForm.group}
              onChange={(event) =>
                setGuestForm((current) => ({
                  ...current,
                  group: event.target.value,
                }))
              }
              placeholder="Friends"
            />
          </label>
          <button className="primary-button" type="submit">
            <Sparkles size={16} aria-hidden="true" />
            Generate Link
          </button>
        </form>

        <div className="guest-links">
          {guests.map((guest) => (
            <div className="guest-row" key={`${guest.name}-${guest.group}`}>
              <div>
                <strong>{guest.name}</strong>
                <span>
                  {guest.partySize} invited · {guest.group}
                </span>
              </div>
              <a
                href={getInvitePath(guest)}
                className="secondary-link"
              >
                View Invitation
              </a>
              <button
                className="icon-button compact"
                onClick={() => copyInvite(guest)}
                aria-label={`Copy Invitation Link for ${guest.name}`}
                type="button"
              >
                <Copy size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="response-bar">
        <span>
          {responses.length} RSVP response{responses.length === 1 ? "" : "s"} on
          this device
        </span>
        <button className="secondary-button" onClick={downloadCsv} type="button">
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   Final Section + Footer
   ============================================================ */

function FinalSection({ countdown }) {
  return (
    <section
      className="final-section"
      style={{ "--final-image": `url("${engagementConfig.finalImage}")` }}
    >
      <div>
        <p className="eyebrow">With love and gratitude</p>
        <h2>
          {countdown.days} days until our celebration begins.
        </h2>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span className="script">Amrit &amp; Bidhata</span>
      <p>{engagementConfig.engagementDateLabel} · Made with love</p>
    </footer>
  );
}

/* ============================================================
   Invite page
   ============================================================ */

function InvitePage() {
  const guest = decodeInvite(getInviteToken()) || {
    name: "Dear Guest",
    partySize: 2,
    group: "Guest",
    id: "preview",
  };
  const [form, setForm] = useState({
    attending: "yes",
    guestCount: Number(guest.partySize) || 1,
    message: "",
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!inviteOpen) {
      document.body.style.overflow = "hidden";
    } else {
      const timer = window.setTimeout(() => {
        document.body.style.overflow = "";
      }, 2200);
      return () => window.clearTimeout(timer);
    }
  }, [inviteOpen]);

  async function submitRsvp(event) {
    event.preventDefault();
    const response = {
      inviteId: guest.id,
      guestName: guest.name,
      attending: form.attending,
      guestCount: form.attending === "yes" ? Number(form.guestCount) : 0,
      message: form.message.trim(),
      submittedAt: new Date().toISOString(),
    };
    const existing = getStoredResponses().filter(
      (item) => item.inviteId !== response.inviteId,
    );
    setStoredResponses([...existing, response]);

    if (engagementConfig.rsvpEndpoint) {
      await fetch(engagementConfig.rsvpEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
    }

    setSubmitted(true);
  }

  return (
    <>
      <DoorOverlay
        open={inviteOpen}
        onOpen={() => setInviteOpen(true)}
        mark="An engagement invitation"
        recipient={guest.name}
      />
      <main className="invite-page">
        <section className="invite-hero">
        <article className="invite-card">
          <img src={engagementConfig.inviteImage} alt="" />
          <div className="invite-overlay">
            <span className="stamp">Engagement Party Invitation</span>
            <h1>{engagementConfig.coupleNames}</h1>
            <span className="for">For {guest.name}</span>
            <div className="invite-event-details">
              <strong>{engagementConfig.engagementDateLabel}</strong>
              <span>{engagementConfig.engagementTimeLabel}</span>
            </div>
          </div>
        </article>

        <form className="rsvp-card" onSubmit={submitRsvp}>
          <span className="script">A Note for You</span>
          <h2>{guest.name}</h2>
          <p className="invite-note">
            With joy and family blessings, you are invited to celebrate Amrit
            and Bidhata&rsquo;s engagement on {engagementConfig.engagementDateLabel}.
          </p>
          <a
            className="venue-line"
            href={engagementConfig.engagementMapUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={17} aria-hidden="true" />
            <span>
              <strong>{engagementConfig.engagementVenue}</strong>
              {engagementConfig.engagementAddress}
            </span>
          </a>

          <fieldset className="segmented">
            <legend>Will you attend?</legend>
            <label>
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={form.attending === "yes"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    attending: event.target.value,
                  }))
                }
              />
              Joyfully accept
            </label>
            <label>
              <input
                type="radio"
                name="attending"
                value="no"
                checked={form.attending === "no"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    attending: event.target.value,
                  }))
                }
              />
              Regretfully decline
            </label>
          </fieldset>

          <label>
            Number attending
            <input
              type="number"
              min="1"
              value={form.attending === "no" ? 0 : form.guestCount}
              disabled={form.attending === "no"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  guestCount: event.target.value,
                }))
              }
            />
          </label>
          <label>
            A Note for the Couple
            <textarea
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="Share a blessing or message for Amrit and Bidhata..."
            />
          </label>
          <button className="primary-button" type="submit">
            <Heart size={16} aria-hidden="true" />
            Send RSVP
          </button>
          {submitted ? (
            <p className="success-message">
              RSVP saved on this device — thank you for replying.
            </p>
          ) : null}
        </form>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
