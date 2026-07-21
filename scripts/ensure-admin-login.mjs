/**
 * Ensure the primary admin can sign in:
 * - user exists in Supabase Auth (create if missing)
 * - email is confirmed
 * - profiles.is_admin = true
 * - optional: set password from ADMIN_PASSWORD env
 *
 * Usage (PowerShell):
 *   $env:ADMIN_PASSWORD = "YourNewStrongPassword"
 *   node scripts/ensure-admin-login.mjs
 *
 * Or only promote / confirm (no password change):
 *   node scripts/ensure-admin-login.mjs
 *
 * Loads .env.local from project root.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

function loadEnv() {
  const out = { ...process.env };
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in out)) out[k] = v;
  }
  return out;
}

const env = loadEnv();
const EMAIL = (
  process.env.ADMIN_EMAIL ||
  env.ADMIN_EMAIL ||
  "dennis.mutunga14@gmail.com"
).trim();
const PASSWORD = (process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || "").trim();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  // Paginate — listUsers does not filter by email in all API versions
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find(
      (u) => (u.email || "").toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (users.length < 200) break;
  }
  return null;
}

async function main() {
  console.log(`Supabase project: ${url}`);
  console.log(`Admin email:      ${EMAIL}`);

  let user = await findUserByEmail(EMAIL);

  if (!user) {
    if (!PASSWORD) {
      console.error(
        "\nNo auth user found. Create one:\n" +
          `  $env:ADMIN_PASSWORD = "YourPassword"\n` +
          "  node scripts/ensure-admin-login.mjs\n" +
          "Or create the user in Supabase Dashboard → Authentication → Users.",
      );
      process.exit(1);
    }
    console.log("Creating auth user…");
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.error("createUser failed:", error.message);
      process.exit(1);
    }
    user = data.user;
    console.log("Created user", user.id);
  } else {
    console.log("Found user", user.id);
    if (!user.email_confirmed_at) {
      const { error } = await admin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
      if (error) console.warn("Could not confirm email:", error.message);
      else console.log("Email confirmed.");
    } else {
      console.log("Email already confirmed.");
    }
    if (PASSWORD) {
      const { error } = await admin.auth.admin.updateUserById(user.id, {
        password: PASSWORD,
      });
      if (error) {
        console.error("Password update failed:", error.message);
        process.exit(1);
      }
      console.log("Password updated from ADMIN_PASSWORD.");
    } else {
      console.log(
        "No ADMIN_PASSWORD set — left password unchanged.\n" +
          "  To set a new password:\n" +
          '  $env:ADMIN_PASSWORD = "YourNewPassword"\n' +
          "  node scripts/ensure-admin-login.mjs",
      );
    }
  }

  const { error: profErr } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: EMAIL,
      is_admin: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (profErr) {
    console.error("profiles upsert failed:", profErr.message);
    console.error(
      "Run lib/supabase/migrations/create_profiles_table.sql in Supabase if the table is missing.",
    );
    process.exit(1);
  }
  console.log("profiles.is_admin = true");

  // Verify password if we set one
  if (PASSWORD) {
    const anonKey =
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey) {
      const anon = createClient(url, anonKey);
      const { data: signIn, error: signErr } =
        await anon.auth.signInWithPassword({
          email: EMAIL,
          password: PASSWORD,
        });
      if (signErr) {
        console.error("\nVerify sign-in FAILED:", signErr.message);
        if (/captcha/i.test(signErr.message)) {
          console.error(
            "Supabase Auth captcha may be enabled. In Dashboard → Authentication → Attack Protection,\n" +
              "disable captcha for local testing OR configure Turnstile secrets to match NEXT_PUBLIC_TURNSTILE_SITE_KEY.",
          );
        }
        process.exit(1);
      }
      console.log("\n✓ Password sign-in verified for", signIn.user?.email);
      await anon.auth.signOut();
    }
  }

  console.log(`
Done. Sign in at:
  Local:      http://localhost:3000/admin/login
  Production: https://www.citizenguide.ke/cg-ke-a5wkqciyjpg940u3/login
              (or your NEXT_PUBLIC_ADMIN_BASE_PATH + /login)

Email: ${EMAIL}
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
