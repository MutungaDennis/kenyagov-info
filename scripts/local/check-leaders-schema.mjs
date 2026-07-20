import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(root, ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("SUPABASE_SERVICE_ROLE_KEY");
const id = process.argv[2] || "3bc35450-c8e7-4c5c-932f-0c65199ef16f";

if (!url || !key) {
  console.error("Missing Supabase URL or service role key in .env.local");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

async function main() {
  const sampleRes = await fetch(`${url}/rest/v1/leaders?select=*&limit=1`, {
    headers,
  });
  const sample = await sampleRes.json();
  console.log("sample_status", sampleRes.status);
  let cols = [];
  if (Array.isArray(sample) && sample[0]) {
    cols = Object.keys(sample[0]).sort();
  } else {
    console.log("sample_body", JSON.stringify(sample).slice(0, 600));
  }
  console.log("leaders_columns", cols.join(", "));
  for (const c of [
    "name_titles",
    "social_media",
    "academic_qualifications",
    "education",
    "first_name",
    "surname",
    "other_names",
    "bio",
    "level",
    "is_active",
    "current_party",
    "current_organization",
    "title",
    "full_name",
  ]) {
    console.log(`has_${c}`, cols.includes(c));
  }

  const rowRes = await fetch(
    `${url}/rest/v1/leaders?id=eq.${id}&select=*`,
    { headers },
  );
  const row = await rowRes.json();
  console.log("row_status", rowRes.status);
  if (Array.isArray(row) && row[0]) {
    const o = row[0];
    console.log(
      "row_snippet",
      JSON.stringify({
        id: o.id,
        slug: o.slug,
        first_name: o.first_name,
        other_names: o.other_names,
        surname: o.surname,
        full_name: o.full_name,
        title: o.title,
        bio: typeof o.bio === "string" ? o.bio.slice(0, 100) : o.bio,
        name_titles: o.name_titles,
        social_media: o.social_media,
        level: o.level,
        current_party: o.current_party,
        is_active: o.is_active,
      }),
    );
  } else {
    console.log("row_body", JSON.stringify(row).slice(0, 800));
  }

  // Probe missing column
  const probe = await fetch(`${url}/rest/v1/leaders?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ name_titles: ["Hon."] }),
  });
  const probeText = await probe.text();
  console.log("probe_name_titles", probe.status, probeText.slice(0, 500));

  // Probe a core field update (toggle nothing meaningful — use bio append test with revert)
  const before = Array.isArray(row) && row[0] ? row[0] : null;
  if (before) {
    const marker = ` [schema-check ${Date.now()}]`;
    const newBio = ((before.bio || "") + marker).slice(0, 5000);
    const up = await fetch(`${url}/rest/v1/leaders?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ bio: newBio }),
    });
    const upText = await up.text();
    console.log("probe_bio_update", up.status, upText.slice(0, 300));
    // revert
    await fetch(`${url}/rest/v1/leaders?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bio: before.bio }),
    });
    console.log("bio_reverted");
  }

  // leader_roles
  const rolesRes = await fetch(
    `${url}/rest/v1/leader_roles?leader_id=eq.${id}&select=*&limit=5`,
    { headers },
  );
  const roles = await rolesRes.json();
  console.log("roles_status", rolesRes.status);
  if (Array.isArray(roles) && roles[0]) {
    console.log("role_keys", Object.keys(roles[0]).sort().join(", "));
    console.log(
      "roles_count",
      roles.length,
      "sample_title",
      roles[0].title,
      "term",
      roles[0].term_start_date,
      roles[0].term_end_date,
    );
  } else {
    console.log("roles_body", JSON.stringify(roles).slice(0, 500));
  }

  // Try full payload like admin form would send
  const fullProbe = await fetch(`${url}/rest/v1/leaders?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      first_name: before?.first_name,
      other_names: before?.other_names,
      surname: before?.surname,
      slug: before?.slug,
      title: before?.title,
      bio: before?.bio,
      name_titles: ["Hon."],
      social_media: { x: "https://x.com/test" },
      academic_qualifications: [{ degree: "BA" }],
      is_active: true,
    }),
  });
  const fullText = await fullProbe.text();
  console.log("probe_full_payload", fullProbe.status, fullText.slice(0, 600));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
