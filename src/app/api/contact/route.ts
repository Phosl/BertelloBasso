import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(4000),
  privacy: z.literal(true),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ok: false}, {status: 400});
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return NextResponse.json({ok: true, mode: "demo"});
  }

  const client = createClient(url, serviceKey, {
    auth: {persistSession: false, autoRefreshToken: false},
  });
  const {error} = await client.from("inquiries").insert({
    name: result.data.name,
    email: result.data.email,
    subject: result.data.subject,
    message: result.data.message,
  });

  if (error) {
    console.error({
      scope: "contact",
      operation: "insert",
      resource: "inquiries",
      code: error.code,
    });
    return NextResponse.json({ok: false}, {status: 503});
  }

  return NextResponse.json({ok: true, mode: "supabase"});
}
