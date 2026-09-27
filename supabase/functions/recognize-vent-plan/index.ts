import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const origins = new Set(["https://vent.it.com", "https://www.vent.it.com", "https://vent-it-com.onrender.com"]);
const types = ["living", "livingKitchen", "bedroom", "office", "kitchen", "bathroom", "wc", "utility", "hall", "vestibule", "technical", "other"];
const reply = (body: unknown, status: number, headers: HeadersInit) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async request => {
  const origin = request.headers.get("origin") || "";
  const headers = {
    "access-control-allow-origin": origins.has(origin) ? origin : "https://vent.it.com",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "authorization, apikey, content-type",
    "content-type": "application/json",
    "vary": "Origin",
  };
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST" || !origins.has(origin)) return reply({ error: "forbidden" }, 403, headers);
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return reply({ error: "recognition_not_configured" }, 503, headers);

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!bearer) return reply({ error: "sign_in_required" }, 401, headers);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: { user }, error: authError } = await sb.auth.getUser(bearer);
  if (authError || !user) return reply({ error: "sign_in_required" }, 401, headers);

  try {
    if (Number(request.headers.get("content-length")) > 4_000_000) return reply({ error: "image_too_large" }, 413, headers);
    const { image } = await request.json();
    if (typeof image !== "string" || image.length > 3_000_000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image))
      return reply({ error: "invalid_image" }, 400, headers);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        signal: controller.signal,
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: Deno.env.get("VENT_PLAN_VISION_MODEL") || "gpt-4o",
          store: false,
          max_output_tokens: 2500,
          input: [{ role: "user", content: [
            { type: "input_text", text: `Analyze this residential floor plan, which is exactly 1000 x 700 pixels. Return visible room rectangles in pixel coordinates (x,y,w,h), room labels and room types. Allowed types: ${types.join(", ")}. Use livingKitchen for a clearly labeled combined living room and kitchen without a separating wall; keep it one room. Do not invent a kitchen area or a wall when neither is visible. Include an HRV unit position only if a clear technical/service location is visible; otherwise use (900,90). Do not invent rooms that cannot be seen. If boundaries are unclear, omit the room and note uncertainty. Treat this as a draft; do not calculate engineering airflow, terminal counts, duct paths or real-world scale.` },
            { type: "input_image", image_url: image, detail: "high" },
          ] }],
          text: { format: { type: "json_schema", name: "floor_plan_draft", strict: true, schema: {
            type: "object", additionalProperties: false, required: ["rooms", "unit", "uncertainties"],
            properties: {
              rooms: { type: "array", items: { type: "object", additionalProperties: false,
                required: ["name", "type", "x", "y", "w", "h"],
                properties: { name: { type: "string" }, type: { type: "string", enum: types }, x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" } } } },
              unit: { type: "object", additionalProperties: false, required: ["x", "y"], properties: { x: { type: "number" }, y: { type: "number" } } },
              uncertainties: { type: "array", items: { type: "string" } },
            },
          } } },
        }),
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) { console.error("Plan model returned", response.status); return reply({ error: "recognition_unavailable" }, 502, headers); }
    const result = await response.json();
    const content = result.output?.flatMap((entry: any) => entry.content || []).find((entry: any) => entry.type === "output_text")?.text;
    if (!content) return reply({ error: "recognition_empty" }, 502, headers);
    const draft = JSON.parse(content);
    const clamp = (value: unknown, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number(value) || 0));
    const rooms = (Array.isArray(draft.rooms) ? draft.rooms : []).slice(0, 40).map((room: any) => ({
      name: String(room.name || "Room").slice(0, 60),
      type: types.includes(room.type) ? room.type : "other",
      x: clamp(room.x, 20, 950), y: clamp(room.y, 20, 650),
      w: clamp(room.w, 40, 950), h: clamp(room.h, 40, 650),
    })).map((room: any) => ({ ...room, w: Math.min(room.w, 980 - room.x), h: Math.min(room.h, 680 - room.y) }));
    if (!rooms.length) return reply({ error: "no_rooms_found" }, 422, headers);
    return reply({ rooms, unit: { x: clamp(draft.unit?.x, 30, 970), y: clamp(draft.unit?.y, 30, 670) },
      uncertainties: (Array.isArray(draft.uncertainties) ? draft.uncertainties : []).slice(0, 8).map((x: unknown) => String(x).slice(0, 180)) }, 200, headers);
  } catch (error) {
    console.error("Plan recognition failed", error);
    return reply({ error: "recognition_unavailable" }, 502, headers);
  }
});
