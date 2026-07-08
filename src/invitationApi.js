const API_BASE = (import.meta.env.VITE_INVITATION_API_URL || "").replace(/\/$/, "");

export function hasInvitationBackend() {
  return Boolean(API_BASE);
}

async function apiRequest(path, options = {}) {
  if (!API_BASE) {
    throw new Error("Invitation backend is not configured.");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.adminSecret ? { "x-admin-secret": options.adminSecret } : {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Invitation backend request failed.");
  }

  return payload;
}

export async function listInvitations(adminSecret) {
  const payload = await apiRequest("/admin/invitations", { adminSecret });
  return payload.invitations || [];
}

export async function createInvitation(guest, adminSecret) {
  const payload = await apiRequest("/admin/invitations", {
    adminSecret,
    method: "POST",
    body: {
      guestName: guest.name,
      invitedCount: Number(guest.partySize) || 1,
      groupName: guest.group || "Guest",
    },
  });

  return payload.invitation;
}

export async function getInvitation(token) {
  return apiRequest(`/invite/${encodeURIComponent(token)}`);
}

export async function submitInvitationRsvp(token, response) {
  return apiRequest(`/rsvp/${encodeURIComponent(token)}`, {
    method: "POST",
    body: response,
  });
}

export async function submitGenericRsvp(response) {
  return apiRequest("/rsvp/generic", {
    method: "POST",
    body: response,
  });
}
