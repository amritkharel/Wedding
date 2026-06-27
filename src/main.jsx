import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CakeSlice,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  DoorOpen,
  Download,
  Heart,
  MapPin,
  Music,
  PartyPopper,
  Sparkles,
  Utensils,
  Wine,
} from "lucide-react";
import {
  createInvitation,
  getInvitation,
  hasInvitationBackend,
  listInvitations,
  submitInvitationRsvp,
} from "./invitationApi.js";
import "./styles.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

const eventProgram = [
  { time: "5:00 PM", dateTime: "17:00", title: "Welcome Hour · Pani Puri & Samosa Chaat", Icon: Utensils },
  { time: "6:15 PM", dateTime: "18:15", title: "Doors Open · Photobooth Opens", Icon: DoorOpen },
  { time: "6:30 PM", dateTime: "18:30", title: "Bar Opens", Icon: Wine },
  { time: "7:00 PM", dateTime: "19:00", title: "Grand Entrance & First Dance", Icon: Heart },
  { time: "7:15 PM", dateTime: "19:15", title: "Champagne Popping", Icon: Sparkles },
  { time: "7:20 PM", dateTime: "19:20", title: "Dinner Starts · Stage Photos", Icon: Utensils },
  { time: "8:45 PM", dateTime: "20:45", title: "Performances by Family & Friends", Icon: Music },
  { time: "9:30 PM", dateTime: "21:30", title: "Cake Cutting", Icon: CakeSlice },
  { time: "9:45 PM", dateTime: "21:45", title: "Open Dance Floor", Icon: PartyPopper },
  { time: "10:30 PM", dateTime: "22:30", title: "Banquet Bar Closes", Icon: Wine },
  { time: "11:00 PM", dateTime: "23:00", title: "Event Ends", emoji: "😢", Icon: Clock },
];

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
  inviteImage: asset("couple/garden-walk.jpg"),
  envelopePaper: asset("envelope/floral-envelope.jpg"),
  waxSealImage: asset("envelope/wax-seal-ab.jpg"),
  contactEmail: "hello@amritandbidhata.com",
  storyCards: [
    {
      chapter: "Chapter One",
      date: "February - Burleson County, Texas",
      title: "Where the warmth began",
      image: asset("assets/couple/texas-chapter.jpg"),
      text:
        "A late-afternoon smile in Texas, the kind of soft, ordinary moment that turned out to be the beginning of every chapter after it.",
    },
    {
      chapter: "Chapter Two",
      date: "March - Washington, D.C.",
      title: "Blue skies and bright laughter",
      image: asset("assets/couple/dc-chapter-one.jpg"),
      text:
        "The capital under a wide spring sky. Two people laughing into the sun, already writing the kind of story they hadn't quite named yet.",
    },
    {
      chapter: "Chapter Three",
      date: "March - The Tidal Basin",
      title: "Beneath the blossoms",
      image: asset("assets/couple/dc-chapter-two.jpg"),
      text:
        "Cherry blossoms fell like soft confetti. A photograph that needed no filter, because the world had already turned pink for them.",
    },
    {
      chapter: "Chapter Five",
      date: "May - The rose walk",
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
      text: "A golden selfie from Burleson County opens the album, the beginning of an unforgettable year.",
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
      text: "A long walk through the rose garden, the moment forever stopped feeling far away.",
    },
    {
      year: "Sep 6, 2026",
      title: "Engagement day",
      text: "Family, blessings, and the first official word of forever, said out loud.",
    },
  ],
  moments: [
    {
      image: asset("assets/couple/garden-walk.jpg"),
      title: "Rose walk",
      place: "May - Rose garden",
    },
    {
      image: asset("assets/couple/dc-chapter-two.jpg"),
      title: "Blossom day",
      place: "March - Washington, D.C.",
    },
    {
      image: asset("assets/couple/potomac-chapter.jpg"),
      title: "Temple morning",
      place: "Potomac, Maryland",
    },
    {
      image: asset("assets/couple/dc-chapter-one.jpg"),
      title: "Bright skies",
      place: "March - D.C.",
    },
    {
      image: asset("assets/couple/texas-chapter.jpg"),
      title: "Texas warmth",
      place: "February - Burleson County",
    },
    {
      image: asset("assets/couple/bethesda-chapter.jpg"),
      title: "Everyday us",
      place: "Everyday - Bethesda, Maryland",
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
  return `${getBasePath()}/invite?g=${guest.token || encodeInvite(guest)}`;
}

function normalizeInvitation(invitation) {
  return {
    id: invitation.id,
    token: invitation.token,
    name: invitation.guestName || invitation.guest_name || invitation.name,
    partySize:
      invitation.invitedCount ||
      invitation.invited_count ||
      invitation.partySize ||
      1,
    group:
      invitation.groupName ||
      invitation.group_name ||
      invitation.group ||
      "Guest",
    response: invitation.response || invitation.rsvp || null,
  };
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
      }, 1500);
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
  const invitePhoto = `url("${engagementConfig.inviteImage}")`;
  const envelopePaper = `url("${engagementConfig.envelopePaper}")`;
  const buttonLabel = recipient ? "Open Your Invitation" : "Enter Website";
  const coverGuest = recipient ? `${recipient}` : (mark || "Together with our families");

  return (
    <div
      className={`door-overlay realistic-envelope${recipient ? " personal-envelope" : " home-envelope"}${open ? " open" : ""}`}
      aria-hidden={open}
    >
      <div
        className="envelope-stage"
        style={{ "--envelope-photo": invitePhoto, "--envelope-paper": envelopePaper }}
      >
        <div className="phone-invite-card" aria-hidden="true">
          <div className="invite-reveal-card">
            <div className="invite-reveal-art">
              <span>{mark || "Together with our families"}</span>
              <h1>{engagementConfig.coupleNames}</h1>
              {recipient ? <p>For {recipient}</p> : null}
              <div>
                <strong>{engagementConfig.engagementDateLabel}</strong>
                <small>{engagementConfig.engagementTimeLabel}</small>
              </div>
            </div>
          </div>

          <div className="envelope-cover">
            <div className="cover-paper">
              <div className="cover-copy">
                <span className="cover-guest">{coverGuest}</span>
                <span className="cover-invite-text">You are invited</span>
              </div>
            </div>
            <div className="envelope-mouth" aria-hidden="true" />
            <div className="cover-flap-assembly">
              <div className="cover-flap cover-flap-top" aria-hidden="true" />
              <div className="cover-flap cover-flap-back" aria-hidden="true" />
            </div>
            <button
              className="door-cta wax-seal"
              onClick={onOpen}
              type="button"
              aria-label={buttonLabel}
            >
              <span className="wax-shadow" aria-hidden="true" />
              <img src={engagementConfig.waxSealImage} alt="" aria-hidden="true" />
              <span className="wax-label">Tap to open</span>
            </button>
          </div>
        </div>
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
          A living album of the in-between: sunlight, blossoms, quiet streets,
          and the soft moments that brought us here.
        </p>
      </div>

      <div className="moments-carousel">
        <figure className="moment-feature" key={active.title}>
          <img src={active.image} alt={`${active.title} - ${active.place}`} />
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
  const backendEnabled = hasInvitationBackend();
  const [guests, setGuests] = useState(() =>
    backendEnabled ? [] : sampleGuests,
  );
  const [guestForm, setGuestForm] = useState({
    name: "",
    partySize: "2",
    group: "Family",
  });
  const [adminSecret, setAdminSecret] = useState(
    () => sessionStorage.getItem("engagement-admin-secret") || "",
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState(() => getStoredResponses());
  const responseRows = backendEnabled
    ? guests
        .filter((guest) => guest.response)
        .map((guest) => ({
          guestName: guest.name,
          attending: guest.response.attending ? "yes" : "no",
          guestCount: guest.response.guestCount ?? guest.response.guest_count ?? 0,
          message: guest.response.message || "",
          submittedAt:
            guest.response.submittedAt ||
            guest.response.submitted_at ||
            "",
        }))
    : responses;

  useEffect(() => {
    if (backendEnabled) return undefined;
    const refresh = () => setResponses(getStoredResponses());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [backendEnabled]);

  useEffect(() => {
    if (!backendEnabled || !adminSecret) return undefined;
    let active = true;

    sessionStorage.setItem("engagement-admin-secret", adminSecret);
    setIsLoading(true);
    setStatusMessage("Loading invitations...");

    listInvitations(adminSecret)
      .then((items) => {
        if (!active) return;
        setGuests(items.map(normalizeInvitation));
        setStatusMessage("Backend connected. Invitations are stored in the database.");
      })
      .catch((error) => {
        if (!active) return;
        setStatusMessage(error.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [adminSecret, backendEnabled]);

  async function addGuest(event) {
    event.preventDefault();
    if (!guestForm.name.trim()) return;

    if (backendEnabled) {
      if (!adminSecret) {
        setStatusMessage("Enter the admin secret before creating invite links.");
        return;
      }

      setIsLoading(true);
      setStatusMessage("Creating invite...");
      try {
        const invitation = await createInvitation(
          {
            name: guestForm.name.trim(),
            partySize: Number(guestForm.partySize) || 1,
            group: guestForm.group.trim() || "Guest",
          },
          adminSecret,
        );
        setGuests((current) => [normalizeInvitation(invitation), ...current]);
        setGuestForm({ name: "", partySize: "2", group: guestForm.group });
        setStatusMessage("Invite saved to the database.");
      } catch (error) {
        setStatusMessage(error.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

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
    setStatusMessage(`Copied invite link for ${guest.name}.`);
  }

  function downloadCsv() {
    const header = [
      "guestName",
      "attending",
      "guestCount",
      "message",
      "submittedAt",
    ];
    const rows = responseRows.map((response) =>
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
          Generate a private database-backed link for every family or friend.
          Each invite opens with their name and saves their RSVP permanently.
        </p>
      </div>

      {backendEnabled ? (
        <div className="backend-panel">
          <label>
            Admin Secret
            <input
              type="password"
              value={adminSecret}
              onChange={(event) => setAdminSecret(event.target.value)}
              placeholder="Enter your backend admin secret"
            />
          </label>
          <p>
            Backend mode is on. This secret is sent only to your API function,
            not stored in the site code.
          </p>
        </div>
      ) : (
        <div className="backend-panel warning">
          <strong>Prototype mode</strong>
          <p>
            No backend URL is configured, so invites and RSVPs are saved only on
            this browser. Set <code>VITE_INVITATION_API_URL</code> for production.
          </p>
        </div>
      )}

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
          <button className="primary-button" type="submit" disabled={isLoading}>
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
                  {guest.partySize} invited - {guest.group}
                  {guest.response ? " - RSVP received" : ""}
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
          {responseRows.length} RSVP response{responseRows.length === 1 ? "" : "s"}
          {backendEnabled ? " in the database" : " on this device"}
        </span>
        <button className="secondary-button" onClick={downloadCsv} type="button">
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      </div>
      {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
    </section>
  );
}

/* ============================================================
   Final Section + Footer
   ============================================================ */

function FinalSection({ countdown }) {
  return (
    <section className="final-section">
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
      <p>{engagementConfig.engagementDateLabel} - Made with love</p>
    </footer>
  );
}

/* ============================================================
   Invite page
   ============================================================ */

function EventProgram() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`event-program${isVisible ? " is-visible" : ""}`}
      ref={sectionRef}
      aria-labelledby="event-program-title"
    >
      <header className="program-heading">
        <span className="script" aria-hidden="true">The</span>
        <h2 id="event-program-title" aria-label="The Program">
          {Array.from("PROGRAM").map((letter, index) => (
            <span
              className="program-letter"
              style={{ "--letter-index": index }}
              aria-hidden="true"
              key={`${letter}-${index}`}
            >
              {letter}
            </span>
          ))}
        </h2>
        <p>{engagementConfig.engagementDateLabel} · The Springs in Katy</p>
      </header>

      <ol className="program-timeline">
        {eventProgram.map(({ time, dateTime, title, emoji, Icon }, index) => (
          <li
            className={`program-entry ${index % 2 === 0 ? "program-left" : "program-right"}`}
            style={{ "--event-index": index }}
            key={dateTime}
          >
            <div className="program-copy">
              <time dateTime={dateTime}>{time}</time>
              <h3>{title}</h3>
            </div>
            <span className="program-marker" aria-hidden="true" />
            <span className="program-icon" aria-hidden="true">
              {emoji ? <span className="program-emoji">{emoji}</span> : <Icon strokeWidth={1.35} />}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function InvitePage() {
  const backendEnabled = hasInvitationBackend();
  const inviteToken = getInviteToken();
  const decodedGuest = useMemo(() => decodeInvite(inviteToken), [inviteToken]);
  const fallbackGuest = decodedGuest || {
    name: "Dear Guest",
    partySize: 2,
    group: "Guest",
    id: "preview",
  };
  const [guest, setGuest] = useState(() =>
    backendEnabled && inviteToken && !decodedGuest ? null : fallbackGuest,
  );
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({
    attending: "yes",
    guestCount: Number(fallbackGuest.partySize) || 1,
    message: "",
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!backendEnabled || !inviteToken) return undefined;
    let active = true;

    getInvitation(inviteToken)
      .then((payload) => {
        if (!active) return;
        const invitation = normalizeInvitation(payload.invitation);
        setGuest(invitation);
        setForm((current) => ({
          ...current,
          guestCount: Number(invitation.partySize) || 1,
        }));
      })
      .catch((error) => {
        if (!active) return;
        if (decodedGuest) {
          setGuest(decodedGuest);
        } else {
          setLoadError(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, [backendEnabled, decodedGuest, inviteToken]);

  useEffect(() => {
    if (!inviteOpen) {
      document.body.style.overflow = "hidden";
    } else {
      const timer = window.setTimeout(() => {
        document.body.style.overflow = "";
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [inviteOpen]);

  async function submitRsvp(event) {
    event.preventDefault();
    if (!guest) return;

    const response = {
      inviteId: guest.id,
      guestName: guest.name,
      attending: form.attending,
      guestCount: form.attending === "yes" ? Number(form.guestCount) : 0,
      message: form.message.trim(),
      submittedAt: new Date().toISOString(),
    };

    if (backendEnabled && inviteToken && guest.token) {
      await submitInvitationRsvp(inviteToken, {
        attending: form.attending === "yes",
        guestCount: response.guestCount,
        message: response.message,
      });
      setSubmitted(true);
      return;
    }

    const existing = getStoredResponses().filter(
      (item) => item.inviteId !== response.inviteId,
    );
    setStoredResponses([...existing, response]);
    setSubmitted(true);
  }

  const displayGuest = guest || fallbackGuest;

  return (
    <>
      <DoorOverlay
        open={inviteOpen}
        onOpen={() => setInviteOpen(true)}
        mark="An engagement invitation"
        recipient={displayGuest.name}
      />
      <main className="invite-page">
        <section className="invite-hero">
        <article className="invite-card">
          <img src={engagementConfig.inviteImage} alt="" />
          <div className="invite-overlay">
            <div className="invite-acrylic">
              <span className="stamp">We&rsquo;re Engaged!</span>
              <h1>
                Celebrate
                <small>with us</small>
              </h1>
              <p className="invite-toast">Let&rsquo;s eat, drink &amp; have a good time</p>
              <strong className="invite-names">{engagementConfig.coupleNames}</strong>
              <span className="for">Especially for {displayGuest.name}</span>
              <div className="invite-event-details">
                <strong>{engagementConfig.engagementDateLabel}</strong>
                <span>{engagementConfig.engagementTimeLabel} · {engagementConfig.engagementVenue}</span>
              </div>
            </div>
          </div>
        </article>

        <EventProgram />

        <form className="rsvp-card" onSubmit={submitRsvp}>
          <span className="script">A Note for You</span>
          <h2>{displayGuest.name}</h2>
          {loadError ? <p className="error-message">{loadError}</p> : null}
          {!guest && !loadError ? (
            <p className="invite-note">Loading your invitation...</p>
          ) : null}
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
          <button
            className="primary-button"
            type="submit"
            disabled={!guest || Boolean(loadError)}
          >
            <Heart size={16} aria-hidden="true" />
            Send RSVP
          </button>
          {submitted ? (
            <p className="success-message">
              RSVP saved. Thank you for replying.
            </p>
          ) : null}
        </form>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
