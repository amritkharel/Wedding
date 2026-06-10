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
  shortNames: "A + B",
  engagementDate: "2026-09-06T18:00:00-05:00",
  weddingDate: "",
  engagementVenue: "Engagement celebration venue",
  weddingVenue: "Wedding venue to be announced",
  heroImage: asset("assets/couple/pond-kiss.jpg"),
  inviteImage: asset("assets/couple/garden-walk.jpg"),
  storyImage: asset("assets/couple/dc-chapter-two.jpg"),
  contactEmail: "your-email@example.com",
  rsvpEndpoint: "",
  storyCards: [
    {
      date: "Feb 13, 2026 · Burleson County, Texas",
      title: "Golden-hour smiles",
      image: asset("assets/couple/texas-chapter.jpg"),
      text:
        "A warm little chapter, saved in the metadata as Texas and remembered by the way the light found you both.",
    },
    {
      date: "Mar 21, 2026 · Washington, D.C.",
      title: "Spring in the city",
      image: asset("assets/couple/dc-chapter-one.jpg"),
      text:
        "Blue sky, bright laughter, and a D.C. afternoon that already looks like a favorite page in the album.",
    },
    {
      date: "Mar 21, 2026 · Washington, D.C.",
      title: "Blossoms around us",
      image: asset("assets/couple/dc-chapter-two.jpg"),
      text:
        "The flowers did what flowers do best: made the whole day feel softer, brighter, and a little unreal.",
    },
    {
      date: "Apr 3, 2026 · Garden pond",
      title: "A quiet pause",
      image: asset("assets/couple/pond-kiss.jpg"),
      text:
        "One still moment by the water, framed by spring trees and the kind of calm that feels like home.",
    },
    {
      date: "May 24, 2026 · Rose garden",
      title: "Walking forward",
      image: asset("assets/couple/garden-walk.jpg"),
      text:
        "Hands linked, flowers beside you, and the story already moving toward a day everyone will gather for.",
    },
  ],
  timeline: [
    {
      year: "Feb 13, 2026",
      title: "Texas warmth",
      text: "A golden selfie from Burleson County, Texas, begins this photo trail.",
    },
    {
      year: "Mar 21, 2026",
      title: "D.C. spring",
      text: "Washington, D.C. gave you blue skies, monuments, and blossoms.",
    },
    {
      year: "Apr 3, 2026",
      title: "By the pond",
      text: "A garden pause became the hero image of this little love story.",
    },
    {
      year: "Sep 6, 2026",
      title: "Engagement",
      text: "The celebration begins with family, blessings, and joy.",
    },
    {
      year: "Soon",
      title: "Wedding",
      text: "Set the wedding date in the config when it is ready.",
    },
  ],
  moments: [
    {
      image: asset("assets/couple/pond-kiss.jpg"),
      title: "Garden Stillness",
      place: "April 2026",
    },
    {
      image: asset("assets/couple/garden-walk.jpg"),
      title: "Rose Walk",
      place: "May 2026",
    },
    {
      image: asset("assets/couple/dc-chapter-two.jpg"),
      title: "Blossom Day",
      place: "Washington, D.C.",
    },
    {
      image: asset("assets/couple/potomac-chapter.jpg"),
      title: "Temple Morning",
      place: "Potomac, Maryland",
    },
    {
      image: asset("assets/couple/bethesda-chapter.jpg"),
      title: "Everyday Us",
      place: "East Bethesda, Maryland",
    },
  ],
};

const sampleGuests = [
  { id: "aarav-patel", name: "Aarav Patel", partySize: 2, group: "Family" },
  { id: "meera-shah", name: "Meera Shah", partySize: 4, group: "Friends" },
  { id: "rao-family", name: "The Rao Family", partySize: 5, group: "Family" },
];

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

function App() {
  const isInvite = window.location.pathname.includes("/invite");
  return isInvite ? <InvitePage /> : <HomePage />;
}

function HomePage() {
  const countdown = useCountdown();
  const [activeCard, setActiveCard] = useState(0);

  const nextCard = () =>
    setActiveCard((index) => (index + 1) % weddingConfig.storyCards.length);
  const previousCard = () =>
    setActiveCard(
      (index) =>
        (index - 1 + weddingConfig.storyCards.length) %
        weddingConfig.storyCards.length,
    );

  return (
    <main>
      <Hero countdown={countdown} />
      <StoryBook
        activeCard={activeCard}
        nextCard={nextCard}
        previousCard={previousCard}
      />
      <Timeline />
      <MomentsGallery />
      <InvitationStudio />
      <FinalSection countdown={countdown} />
    </main>
  );
}

function Hero({ countdown }) {
  return (
    <section className="hero" id="home">
      <nav className="nav" aria-label="Main navigation">
        <a href="#home" className="brand">
          <Heart size={18} aria-hidden="true" />
          <span>{weddingConfig.shortNames}</span>
        </a>
        <div className="nav-links">
          <a href="#story">Story</a>
          <a href="#timeline">Timeline</a>
          <a href="#moments">Moments</a>
          <a href="#invites">Invites</a>
        </div>
      </nav>

      <div className="hero-frame">
        <img src={weddingConfig.heroImage} alt="" />
        <div className="hero-copy">
          <p className="eyebrow">We are getting engaged</p>
          <h1>{weddingConfig.coupleNames}</h1>
          <p className="hero-date">
            <CalendarDays size={18} aria-hidden="true" />
            September 6, 2026
          </p>
          <Countdown countdown={countdown} />
        </div>
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
      <span className="countdown-label">{countdown.targetLabel} in</span>
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

function StoryBook({ activeCard, nextCard, previousCard }) {
  const card = weddingConfig.storyCards[activeCard];

  return (
    <section className="section story-section" id="story">
      <div className="section-heading">
        <p className="eyebrow">Our story</p>
        <h2>A little book of us</h2>
      </div>

      <div className="storybook">
        <button className="icon-button" onClick={previousCard} aria-label="Previous story">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <article className="book-page" key={card.title}>
          <div className="page-image">
            <img src={card.image} alt="" />
          </div>
          <div className="page-copy">
            <span>{card.date}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        </article>
        <button className="icon-button" onClick={nextCard} aria-label="Next story">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="section timeline-section" id="timeline">
      <div className="section-heading">
        <p className="eyebrow">Milestones</p>
        <h2>The path to forever</h2>
      </div>
      <div className="timeline">
        <svg
          className="timeline-path"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="desktop-route"
            pathLength="1"
            d="M50 0 C10 11 10 22 50 32 C90 42 90 54 50 64 C10 74 10 88 50 100"
          />
          <path
            className="mobile-route"
            pathLength="1"
            d="M50 0 C32 14 68 26 50 40 C32 54 68 68 50 82 C40 90 46 96 50 100"
          />
        </svg>
        {weddingConfig.timeline.map((item, index) => (
          <article className="timeline-item" key={item.title}>
            <span className="timeline-dot">{index + 1}</span>
            <div>
              <small>{item.year}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MomentsGallery() {
  return (
    <section className="section moments-section" id="moments">
      <div className="section-heading">
        <p className="eyebrow">Captured moments</p>
        <h2>Real frames, softly moving</h2>
      </div>
      <div className="moments-grid">
        {weddingConfig.moments.map((moment, index) => (
          <figure className={`moment-tile moment-${index + 1}`} key={moment.title}>
            <img src={moment.image} alt={`${moment.title} - ${moment.place}`} />
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
        <p className="eyebrow">Invitation links</p>
        <h2>Make each RSVP personal</h2>
      </div>

      <div className="studio-grid">
        <form className="guest-form" onSubmit={addGuest}>
          <label>
            Guest or family name
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
            <Sparkles size={18} aria-hidden="true" />
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
                aria-label={`Copy invite for ${guest.name}`}
              >
                <Copy size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="response-bar">
        <span>{responses.length} RSVP response{responses.length === 1 ? "" : "s"} on this device</span>
        <button className="secondary-button" onClick={downloadCsv} type="button">
          <Download size={18} aria-hidden="true" />
          Export CSV
        </button>
      </div>
    </section>
  );
}

function FinalSection({ countdown }) {
  return (
    <section
      className="final-section"
      style={{ "--final-image": `url("${asset("assets/couple/pond-kiss.jpg")}")` }}
    >
      <div>
        <p className="eyebrow">With love</p>
        <h2>{countdown.days} days until the celebration begins</h2>
      </div>
      <a className="primary-button" href="#invites">
        <Mail size={18} aria-hidden="true" />
        Create invites
      </a>
    </section>
  );
}

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
            <p>Wedding Invitation</p>
            <h1>{weddingConfig.coupleNames}</h1>
            <span>For {guest.name}</span>
          </div>
        </div>

        <form className="rsvp-card" onSubmit={submitRsvp}>
          <p className="eyebrow">Personal invite</p>
          <h2>{guest.name}</h2>
          <p className="invite-note">
            You are invited to celebrate Amrit and Bidhata's engagement on September 6, 2026.
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
              Yes
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
              No
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
            Message
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
            <Heart size={18} aria-hidden="true" />
            Send RSVP
          </button>
          {submitted ? (
            <p className="success-message">RSVP saved. Thank you for replying.</p>
          ) : null}
        </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
