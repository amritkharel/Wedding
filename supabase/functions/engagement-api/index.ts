import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultAllowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://amritkharel.github.io",
];

const configuredOrigins = (Deno.env.get("ENGAGEMENT_ALLOWED_ORIGINS") || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const adminSecret = Deno.env.get("ENGAGEMENT_ADMIN_SECRET") || "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || allowedOrigins.has(origin);
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  return {
    "access-control-allow-origin": origin && allowedOrigins.has(origin)
      ? origin
      : defaultAllowedOrigins[0],
    "access-control-allow-headers": "authorization, content-type, x-admin-secret",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "cache-control": "no-store",
    "vary": "Origin",
    "x-content-type-options": "nosniff",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "content-type": "application/json",
    },
  });
}

function requireAdmin(request: Request) {
  const provided = request.headers.get("x-admin-secret") || "";
  return Boolean(adminSecret) && provided === adminSecret;
}

function routePath(url: URL) {
  const marker = "/engagement-api";
  const index = url.pathname.indexOf(marker);
  if (index === -1) return url.pathname;
  return url.pathname.slice(index + marker.length) || "/";
}

function publicInvitation(row: Record<string, unknown>) {
  return {
    id: row.id,
    token: row.token,
    guestName: row.guest_name,
    invitedCount: row.invited_count,
    groupName: row.group_name,
  };
}

async function listAdminInvitations(request: Request) {
  if (!requireAdmin(request)) return json(request, { error: "Unauthorized" }, 401);

  const { data: invitationRows, error: invitationsError } = await supabase
    .from("invitations")
    .select(`
      id,
      token,
      guest_name,
      invited_count,
      group_name,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (invitationsError) return json(request, { error: invitationsError.message }, 500);

  const invitationIds = (invitationRows || []).map((row) => row.id).filter(Boolean);
  const rsvpsByInvitationId = new Map<string, Record<string, unknown>>();

  if (invitationIds.length > 0) {
    const { data: rsvpRows, error: rsvpsError } = await supabase
      .from("rsvps")
      .select("invitation_id, attending, guest_count, message, submitted_at")
      .in("invitation_id", invitationIds);

    if (rsvpsError) return json(request, { error: rsvpsError.message }, 500);

    for (const rsvp of rsvpRows || []) {
      if (typeof rsvp.invitation_id === "string") {
        rsvpsByInvitationId.set(rsvp.invitation_id, rsvp);
      }
    }
  }

  const invitations = (invitationRows || []).map((row) => {
    const rsvp = rsvpsByInvitationId.get(String(row.id)) || null;
    return {
      ...publicInvitation(row),
      createdAt: row.created_at,
      response: rsvp
        ? {
            attending: rsvp.attending,
            guestCount: rsvp.guest_count,
            message: rsvp.message,
            submittedAt: rsvp.submitted_at,
          }
        : null,
    };
  });

  return json(request, { invitations });
}

async function createAdminInvitation(request: Request) {
  if (!requireAdmin(request)) return json(request, { error: "Unauthorized" }, 401);

  const body = await request.json().catch(() => ({}));
  const guestName = String(body.guestName || "").trim().slice(0, 120);
  const invitedCount = Math.min(50, Math.max(1, Math.trunc(Number(body.invitedCount) || 1)));
  const groupName = String(body.groupName || "Guest").trim().slice(0, 80) || "Guest";

  if (!guestName) return json(request, { error: "Guest name is required." }, 400);

  const token = crypto.randomUUID().replaceAll("-", "");
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      token,
      guest_name: guestName,
      invited_count: invitedCount,
      group_name: groupName,
    })
    .select("id, token, guest_name, invited_count, group_name")
    .single();

  if (error) return json(request, { error: error.message }, 500);
  return json(request, { invitation: publicInvitation(data) }, 201);
}

async function getInvite(token: string, request: Request) {
  if (!/^[a-f0-9]{32}$/i.test(token)) {
    return json(request, { error: "Invitation not found." }, 404);
  }

  const { data, error } = await supabase
    .from("invitations")
    .select("id, token, guest_name, invited_count, group_name")
    .eq("token", token)
    .single();

  if (error || !data) return json(request, { error: "Invitation not found." }, 404);
  return json(request, { invitation: publicInvitation(data) });
}

async function saveRsvp(token: string, request: Request) {
  if (!/^[a-f0-9]{32}$/i.test(token)) {
    return json(request, { error: "Invitation not found." }, 404);
  }

  const body = await request.json().catch(() => ({}));
  const attending = body.attending === true;
  const guestCount = attending
    ? Math.min(100, Math.max(1, Math.trunc(Number(body.guestCount) || 1)))
    : 0;
  const message = String(body.message || "").trim().slice(0, 2000);

  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .select("id")
    .eq("token", token)
    .single();

  if (inviteError || !invitation) {
    return json(request, { error: "Invitation not found." }, 404);
  }

  const { data, error } = await supabase
    .from("rsvps")
    .upsert(
      {
        invitation_id: invitation.id,
        attending,
        guest_count: guestCount,
        message,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "invitation_id" },
    )
    .select("attending, guest_count, message, submitted_at")
    .single();

  if (error) return json(request, { error: error.message }, 500);

  return json(request, {
    response: {
      attending: data.attending,
      guestCount: data.guest_count,
      message: data.message,
      submittedAt: data.submitted_at,
    },
  });
}

async function saveGenericRsvp(request: Request) {
  const body = await request.json().catch(() => ({}));
  const guestName = String(body.guestName || "").trim().slice(0, 120);
  const attending = body.attending === true;
  const guestCount = attending
    ? Math.min(100, Math.max(1, Math.trunc(Number(body.guestCount) || 1)))
    : 0;
  const message = String(body.message || "").trim().slice(0, 2000);

  if (!guestName) {
    return json(request, { error: "Guest name is required." }, 400);
  }

  const token = crypto.randomUUID().replaceAll("-", "");
  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .insert({
      token,
      guest_name: guestName,
      invited_count: attending ? guestCount : 1,
      group_name: "Generic Invitation",
    })
    .select("id, token, guest_name, invited_count, group_name")
    .single();

  if (invitationError || !invitation) {
    return json(request, { error: invitationError?.message || "Could not create RSVP." }, 500);
  }

  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      invitation_id: invitation.id,
      attending,
      guest_count: guestCount,
      message,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("attending, guest_count, message, submitted_at")
    .single();

  if (error) {
    await supabase.from("invitations").delete().eq("id", invitation.id);
    return json(request, { error: error.message }, 500);
  }

  return json(request, {
    invitation: publicInvitation(invitation),
    response: {
      attending: data.attending,
      guestCount: data.guest_count,
      message: data.message,
      submittedAt: data.submitted_at,
    },
  }, 201);
}

Deno.serve(async (request) => {
  if (!isAllowedOrigin(request)) {
    return json(request, { error: "Origin not allowed." }, 403);
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(request) });
  }

  if (!supabaseUrl || !serviceRoleKey || !adminSecret) {
    return json(request, { error: "Backend environment variables are not configured." }, 500);
  }

  const url = new URL(request.url);
  const path = routePath(url);
  const segments = path.split("/").filter(Boolean);

  if (request.method === "GET" && path === "/health") {
    return json(request, { ok: true });
  }

  if (request.method === "GET" && path === "/admin/invitations") {
    return listAdminInvitations(request);
  }

  if (request.method === "POST" && path === "/admin/invitations") {
    return createAdminInvitation(request);
  }

  if (request.method === "GET" && segments[0] === "invite" && segments[1]) {
    return getInvite(segments[1], request);
  }

  if (request.method === "POST" && path === "/rsvp/generic") {
    return saveGenericRsvp(request);
  }

  if (request.method === "POST" && segments[0] === "rsvp" && segments[1]) {
    return saveRsvp(segments[1], request);
  }

  return json(request, { error: "Not found" }, 404);
});
