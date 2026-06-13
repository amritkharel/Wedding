import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Heart,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import "./styles.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

const weddingConfig = {
  coupleNames: "Amrit & Bidhata",
  coupleFirst: "Amrit",
  coupleSecond: "Bidhata",
  shortNames: "A & B",
  engagementDate: "2026-09-06T18:00:00-05:00",
  engagementDateLabel: "September 6, 2026",
  engagementDay: "06",
  engagementMonth: "Sept",
  engagementYear: "2026",
  engagementWeekday: "Sunday",
  engagementTimeLabel: "6:00 PM",
  weddingDate: "",
  engagementVenue: "Engagement celebration · venue to be announced",
  weddingVenue: "Wedding venue to be announced",
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
  const inviteIndex = path.lastIndexOf("/invite");
  if (inviteIndex >= 0) return path.slice(0, inviteIndex);
  return path === "" ? "" : path;
}

function getInvitePath(guest) {
  return `${getBasePath()}/invite?g=${encodeInvite(guest)}`;
}

function getStoredResponses() {
  try {
    return JSON.parse(localStorage.getItem("wedding-rsvps") || "[]");
  } catch {
    return [];
  }
}

function setStoredResponses(responses) {
  localStorage.setItem("wedding-rsvps", JSON.stringify(responses));
}

function useCountdown() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    const engagement = new Date(weddingConfig.engagementDate);
    const wedding = weddingConfig.weddingDate
      ? new Date(weddingConfig.weddingDate)
      : null;
    const hasEngagementPassed = now >= engagement;
    const target = wedding && hasEngagementPassed ? wedding : engagement;
    const total = Math.max(0, target.getTime() - now.getTime());
    const seconds = Math.floor(total / 1000);

    return {
      targetLabel: wedding && hasEngagementPassed ? "Wedding" : "Engagement",
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
  return isInvite ? <InvitePage /> : <HomePage />;
}

function HomePage() {
  const countdown = useCountdown();
  const [doorOpen, setDoorOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    if (!doorOpen) {
      document.body.style.overflow = "hidden";
    } else {
      const timer = window.setTimeout(() => {
        document.body.style.overflow = "";
      }, 1700);
      return () => window.clearTimeout(timer);
    }
  }, [doorOpen]);

  const nextCard = () =>
    setActiveCard((index) => (index + 1) % weddingConfig.storyCards.length);
  const previousCard = () =>
    setActiveCard(
      (index) =>
        (index - 1 + weddingConfig.storyCards.length) %
        weddingConfig.storyCards.length,
    );

  return (
    <>
      <DoorOverlay open={doorOpen} onOpen={() => setDoorOpen(true)} />
      <main>
        <SiteNav />
        <Hero countdown={countdown} />
        <StoryBook
          activeCard={activeCard}
          setActiveCard={setActiveCard}
          nextCard={nextCard}
          previousCard={previousCard}
        />
        <Timeline />
        <MomentsGallery />
        <InvitationStudio />
        <FinalSection countdown={countdown} />
        <Footer />
      </main>
    </>
  );
}

/* ============================================================
   Door overlay
   ============================================================ */

function DoorOverlay({ open, onOpen }) {
  return (
    <div className={`door-overlay${open ? " open" : ""}`} aria-hidden={open}>
      <div className="door-frame">
        <div className="door-arch">
          <div className="door-panel left" />
          <div className="door-panel right" />
          <div className="door-light" />
          <div className="door-content">
            <p className="door-mark">An Invitation to Forever</p>
            <h1 className="door-title">
              Wedding
              <em>Invitation</em>
            </h1>
            <p className="door-couple">Amrit &amp; Bidhata</p>
            <div className="door-date">
              <strong>{weddingConfig.engagementDay}</strong>
              <span>
                {weddingConfig.engagementMonth} {weddingConfig.engagementYear}
                {" · "}
                {weddingConfig.engagementWeekday}
              </span>
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
        <a href="#story">Story</a>
        <a href="#timeline">Journey</a>
        <a href="#moments">Moments</a>
        <a href="#invites">RSVP</a>
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
            {weddingConfig.coupleFirst}
            <br />
            <em>&amp;</em> {weddingConfig.coupleSecond}
          </h1>
          <div className="hero-line">
            <CalendarDays size={18} aria-hidden="true" />
            <span>{weddingConfig.engagementDateLabel}</span>
            <span className="dot" />
            <span>{weddingConfig.engagementTimeLabel}</span>
          </div>
          <Countdown countdown={countdown} />
        </div>

        <figure className="hero-photo-frame">
          <img src={weddingConfig.heroImage} alt="" />
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
   Story Book
   ============================================================ */

function StoryBook({ activeCard, setActiveCard, nextCard, previousCard }) {
  const card = weddingConfig.storyCards[activeCard];

  return (
    <section className="section story-section" id="story">
      <div className="section-heading">
        <span className="script">Our Story</span>
        <h2>A little book of us</h2>
        <p>
          Five chapters from one unforgettable year — the moments that turned a
          gentle hello into a save-the-date.
        </p>
      </div>

      <div className="storybook">
        <button
          className="icon-button"
          onClick={previousCard}
          aria-label="Previous chapter"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <article className="book-page" key={card.title}>
          <div className="page-image">
            <img src={card.image} alt={card.title} />
          </div>
          <div className="page-copy">
            <span className="chapter">{card.chapter}</span>
            <h3>{card.title}</h3>
            <p className="date">{card.date}</p>
            <p>{card.text}</p>
          </div>
        </article>

        <button
          className="icon-button"
          onClick={nextCard}
          aria-label="Next chapter"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>

        <div className="storybook-dots" role="tablist" aria-label="Chapters">
          {weddingConfig.storyCards.map((c, index) => (
            <button
              key={c.title}
              onClick={() => setActiveCard(index)}
              className={index === activeCard ? "is-active" : ""}
              aria-label={`Go to ${c.title}`}
              aria-selected={index === activeCard}
              role="tab"
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Timeline
   ============================================================ */

function Timeline() {
  return (
    <section className="section timeline-section" id="timeline">
      <div className="section-heading">
        <span className="script">The Journey</span>
        <h2>The path to forever</h2>
        <p>
          Every chapter, every city, every quiet step that brought us here —
          waiting for the family and friends who made it possible.
        </p>
      </div>

      <div className="timeline">
        {weddingConfig.timeline.map((item, index) => (
          <article className="timeline-item" key={item.title}>
            <div className="timeline-card">
              <small>{item.year}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
            <span className="timeline-dot" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="timeline-spacer" />
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Moments Gallery
   ============================================================ */

function MomentsGallery() {
  return (
    <section className="section moments-section" id="moments">
      <div className="section-heading">
        <span className="script">Captured Moments</span>
        <h2>Real frames, softly held</h2>
        <p>
          A small album of the in-between — sunlight, blossoms, quiet streets,
          and the people who made each frame possible.
        </p>
      </div>

      <div className="moments-grid">
        {weddingConfig.moments.map((moment, index) => (
          <figure
            className={`moment-tile moment-${index + 1}`}
            key={moment.title}
          >
            <img src={moment.image} alt={`${moment.title} — ${moment.place}`} />
            <figcaption>
              <strong>{moment.title}</strong>
              <span>{moment.place}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Invitation Studio
   ============================================================ */

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
      "meal",
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
    link.download = "wedding-rsvps.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <section className="section invite-studio" id="invites">
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
            Max guests
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
            Generate link
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
                View
              </a>
              <button
                className="icon-button compact"
                onClick={() => copyInvite(guest)}
                aria-label={`Copy invite link for ${guest.name}`}
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
      style={{ "--final-image": `url("${weddingConfig.finalImage}")` }}
    >
      <div>
        <p className="eyebrow">With love and gratitude</p>
        <h2>
          {countdown.days} days until our celebration begins.
        </h2>
      </div>
      <a className="primary-button" href="#invites">
        <Mail size={16} aria-hidden="true" />
        Create invites
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span className="script">Amrit &amp; Bidhata</span>
      <p>September 6, 2026 · Made with love</p>
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
    guestCount: Math.min(1, guest.partySize),
    meal: "Vegetarian",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  async function submitRsvp(event) {
    event.preventDefault();
    const response = {
      inviteId: guest.id,
      guestName: guest.name,
      attending: form.attending,
      guestCount: form.attending === "yes" ? Number(form.guestCount) : 0,
      meal: form.meal,
      message: form.message.trim(),
      submittedAt: new Date().toISOString(),
    };
    const existing = getStoredResponses().filter(
      (item) => item.inviteId !== response.inviteId,
    );
    setStoredResponses([...existing, response]);

    if (weddingConfig.rsvpEndpoint) {
      await fetch(weddingConfig.rsvpEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
    }

    setSubmitted(true);
  }

  return (
    <main className="invite-page">
      <section className="invite-hero">
        <div className="phone-card">
          <img src={weddingConfig.inviteImage} alt="" />
          <div className="invite-overlay">
            <span className="stamp">Wedding Invitation</span>
            <h1>{weddingConfig.coupleNames}</h1>
            <span className="for">For {guest.name}</span>
          </div>
        </div>

        <form className="rsvp-card" onSubmit={submitRsvp}>
          <span className="script">A note for you</span>
          <h2>{guest.name}</h2>
          <p className="invite-note">
            With joy and family blessings, you are invited to celebrate Amrit
            and Bidhata&rsquo;s engagement on September 6, 2026.
          </p>
          <div className="venue-line">
            <MapPin size={17} aria-hidden="true" />
            {weddingConfig.engagementVenue}
          </div>

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
              min="0"
              max={guest.partySize}
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
            Meal preference
            <select
              value={form.meal}
              onChange={(event) =>
                setForm((current) => ({ ...current, meal: event.target.value }))
              }
            >
              <option>Vegetarian</option>
              <option>Vegan</option>
              <option>Jain</option>
              <option>No preference</option>
            </select>
          </label>
          <label>
            A note for the couple
            <textarea
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="Blessings, song requests, travel notes..."
            />
          </label>
          <button className="primary-button" type="submit">
            <Heart size={16} aria-hidden="true" />
            Send RSVP
          </button>
          {submitted ? (
            <p className="success-message">
              RSVP saved — thank you for replying.
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
