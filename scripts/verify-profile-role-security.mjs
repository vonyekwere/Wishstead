import nextEnv from "@next/env";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

if (!secretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY");
}

const isLocalSupabase =
    supabaseUrl === "http://127.0.0.1:54321" ||
    supabaseUrl === "http://localhost:54321";

if (!isLocalSupabase) {
    throw new Error(
        `Refusing to run profile-role security verification against non-local Supabase URL: ${supabaseUrl}`,
    );
}

const adminSupabase = createClient(supabaseUrl, secretKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

const authenticatedSupabase = createClient(supabaseUrl, publishableKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

const email = `profile-security-${Date.now()}@wishstead.local`;
const password = `Tmp!${randomBytes(24).toString("base64url")}Aa9`;

let userId = null;

try {
    console.log("Creating temporary test user...");

    const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: "Security Test User",
        },
    });

    if (createError) {
        throw new Error(`Unable to create test user: ${createError.message}`);
    }

    userId = createData.user.id;

    console.log("Temporary user created.");
    console.log("Signing in as normal authenticated user...");

    const { error: signInError } = await authenticatedSupabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        throw new Error(`Unable to sign in test user: ${signInError.message}`);
    }

    console.log("\nTEST 1: Update full_name");

    const { error: fullNameError } = await authenticatedSupabase
        .from("profiles")
        .update({
            full_name: "Updated Security Test User",
        })
        .eq("id", userId);

    if (fullNameError) {
        throw new Error(`full_name update FAILED: ${fullNameError.message}`);
    }

    console.log("PASS: authenticated user can update full_name");

    console.log("\nTEST 2: Update avatar_url");

    const { error: avatarError } = await authenticatedSupabase
        .from("profiles")
        .update({
            avatar_url: "https://example.com/security-test-avatar.png",
        })
        .eq("id", userId);

    if (avatarError) {
        throw new Error(`avatar_url update FAILED: ${avatarError.message}`);
    }

    console.log("PASS: authenticated user can update avatar_url");

    console.log("\nTEST 3: Attempt role update");

    const { error: roleError } = await authenticatedSupabase
        .from("profiles")
        .update({
            role: "vendor",
        })
        .eq("id", userId);

    if (!roleError) {
        throw new Error(
            "SECURITY FAILURE: authenticated user was able to update role",
        );
    }

    console.log(`PASS: role update was rejected: ${roleError.message}`);

    console.log("\nVerifying final database values...");

    const { data: profile, error: profileError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("id", userId)
        .single();

    if (profileError) {
        throw new Error(`Unable to verify profile: ${profileError.message}`);
    }

    if (profile.full_name !== "Updated Security Test User") {
        throw new Error("full_name was not persisted correctly");
    }

    if (profile.avatar_url !== "https://example.com/security-test-avatar.png") {
        throw new Error("avatar_url was not persisted correctly");
    }

    if (profile.role !== "customer") {
        throw new Error(
            `SECURITY FAILURE: expected role "customer", received "${profile.role}"`,
        );
    }

    console.log("PASS: full_name persisted");
    console.log("PASS: avatar_url persisted");
    console.log('PASS: role remains "customer"');

    console.log("\nPROFILE ROLE SECURITY TEST PASSED");
} finally {
    await authenticatedSupabase.auth.signOut();

    if (userId) {
        await adminSupabase
            .from("profiles")
            .delete()
            .eq("id", userId);

        await adminSupabase.auth.admin.deleteUser(userId);

        console.log("\nTemporary test user cleaned up.");
    }
}
