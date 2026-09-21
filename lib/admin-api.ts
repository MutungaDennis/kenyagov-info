/**
 * Shared authorization helper for administrator API routes.
 */

import { NextResponse } from "next/server";
import type {
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import { isAdminUserId } from "@/lib/supabase/admin-access";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/supabase/server";

type AdminApiSuccess = {
  ok: true;
  user: User;
  supabase: SupabaseClient;
};

type AdminApiFailure = {
  ok: false;
  response: NextResponse;
};

export type AdminApiResult =
  | AdminApiSuccess
  | AdminApiFailure;

function apiError(
  error: string,
  status: number,
): NextResponse {
  return NextResponse.json(
    {
      error,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function requireAdminApi(): Promise<AdminApiResult> {
  const user =
    await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      response: apiError(
        "Unauthorized",
        401,
      ),
    };
  }

  const isAdmin =
    await isAdminUserId(user.id);

  if (!isAdmin) {
    console.error(
      "Admin API access rejected:",
      {
        userId: user.id,
        email: user.email,
      },
    );

    return {
      ok: false,
      response: apiError(
        "Forbidden",
        403,
      ),
    };
  }

  try {
    const serviceClient =
      createServiceClient();

    return {
      ok: true,
      user,
      supabase: serviceClient,
    };
  } catch (error) {
    console.error(
      "Could not create admin service client:",
      error,
    );

    return {
      ok: false,
      response: apiError(
        "Admin database service unavailable",
        500,
      ),
    };
  }
}

export function slugify(
  input: string,
): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}