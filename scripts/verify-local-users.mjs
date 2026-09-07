import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",

    "WISHSTEAD_TEST_CUSTOMER_EMAIL",
    "WISHSTEAD_TEST_CUSTOMER_NAME",
    "WISHSTEAD_TEST_CUSTOMER_PASSWORD",

    "WISHSTEAD_TEST_VENDOR_EMAIL",
    "WISHSTEAD_TEST_VENDOR_NAME",
    "WISHSTEAD_TEST_VENDOR_PASSWORD",

    "WISHSTEAD_TEST_ADMIN_EMAIL",
    "WISHSTEAD_TEST_ADMIN_NAME",
    "WISHSTEAD_TEST_ADMIN_PASSWORD",

    "WISHSTEAD_TEST_SUPER_ADMIN_EMAIL",
    "WISHSTEAD_TEST_SUPER_ADMIN_NAME",
    "WISHSTEAD_TEST_SUPER_ADMIN_PASSWORD",
];

for (const key of requiredEnvVars) {
    if (!process.env[key]?.trim()) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

const isLocalSupabase =
    supabaseUrl === "http://127.0.0.1:54321" ||
    supabaseUrl === "http://localhost:54321";

if (!isLocalSupabase) {
    throw new Error(
        `Refusing to verify local users against non-local Supabase URL: ${supabaseUrl}`,
    );
}

const testUsers = [
    {
        email: process.env.WISHSTEAD_TEST_CUSTOMER_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_CUSTOMER_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_CUSTOMER_PASSWORD,
        expectedRole: "customer",
    },
    {
        email: process.env.WISHSTEAD_TEST_VENDOR_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_VENDOR_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_VENDOR_PASSWORD,
        expectedRole: "vendor",
    },
    {
        email: process.env.WISHSTEAD_TEST_ADMIN_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_ADMIN_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_ADMIN_PASSWORD,
        expectedRole: "admin",
    },
    {
        email: process.env.WISHSTEAD_TEST_SUPER_ADMIN_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_SUPER_ADMIN_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_SUPER_ADMIN_PASSWORD,
        expectedRole: "super_admin",
    },
];

async function verifyUser(testUser) {
    const supabase = createClient(supabaseUrl, publishableKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });

    const {
        data: { user },
        error: signInError,
    } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
    });

    if (signInError) {
        throw new Error(
            `${testUser.email} login failed: ${signInError.message}`,
        );
    }

    if (!user) {
        throw new Error(`Authenticated user missing for ${testUser.email}`);
    }

    if (user.email?.toLowerCase() !== testUser.email) {
        throw new Error(
            `${testUser.email}: authenticated email does not match expected email`,
        );
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("id", user.id)
        .single();

    if (profileError) {
        throw new Error(
            `${testUser.email} profile fetch failed: ${profileError.message}`,
        );
    }

    if (profile.id !== user.id) {
        throw new Error(
            `${testUser.email}: profile id does not match auth user id`,
        );
    }

    if (profile.full_name !== testUser.fullName) {
        throw new Error(
            `${testUser.email}: expected name "${testUser.fullName}", received "${profile.full_name}"`,
        );
    }

    if (profile.role !== testUser.expectedRole) {
        throw new Error(
            `${testUser.email}: expected role "${testUser.expectedRole}", received "${profile.role}"`,
        );
    }

    console.log(
        `PASS: ${testUser.email} | ${profile.full_name} | ${profile.role}`,
    );

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
        throw new Error(
            `${testUser.email} sign out failed: ${signOutError.message}`,
        );
    }
}

async function verify() {
    console.log("Wishstead local user verification");
    console.log("=================================\n");

    for (const testUser of testUsers) {
        await verifyUser(testUser);
    }

    console.log("\nALL LOCAL USERS VERIFIED");
}

verify().catch((error) => {
    console.error("\nLOCAL USER VERIFICATION FAILED");
    console.error(error.message);
    process.exit(1);
});