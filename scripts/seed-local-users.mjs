import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

const requiredEnvironmentVariables = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SECRET_KEY",

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

for (const key of requiredEnvironmentVariables) {
    if (!process.env[key]?.trim()) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

const isLocalSupabase =
    supabaseUrl === "http://127.0.0.1:54321" ||
    supabaseUrl === "http://localhost:54321";

if (!isLocalSupabase) {
    throw new Error(
        `Refusing to seed LOCAL users against non-local Supabase URL: ${supabaseUrl}`,
    );
}

const supabase = createClient(supabaseUrl, secretKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

const seedUsers = [
    {
        email: process.env.WISHSTEAD_TEST_CUSTOMER_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_CUSTOMER_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_CUSTOMER_PASSWORD,
        role: "customer",
    },
    {
        email: process.env.WISHSTEAD_TEST_VENDOR_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_VENDOR_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_VENDOR_PASSWORD,
        role: "vendor",
    },
    {
        email: process.env.WISHSTEAD_TEST_ADMIN_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_ADMIN_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_ADMIN_PASSWORD,
        role: "admin",
    },
    {
        email: process.env.WISHSTEAD_TEST_SUPER_ADMIN_EMAIL.trim().toLowerCase(),
        fullName: process.env.WISHSTEAD_TEST_SUPER_ADMIN_NAME.trim(),
        password: process.env.WISHSTEAD_TEST_SUPER_ADMIN_PASSWORD,
        role: "super_admin",
    },
];

function validateSeedUsers() {
    const emails = new Set();

    for (const user of seedUsers) {
        if (!user.email.includes("@")) {
            throw new Error(`Invalid email: ${user.email}`);
        }

        if (!user.fullName) {
            throw new Error(`Full name is required for ${user.email}`);
        }

        if (user.password.length < 12) {
            throw new Error(
                `Password for ${user.email} must be at least 12 characters`,
            );
        }

        if (emails.has(user.email)) {
            throw new Error(`Duplicate seed email detected: ${user.email}`);
        }

        emails.add(user.email);
    }
}

async function findUserByEmail(email) {
    const perPage = 100;
    let page = 1;

    while (true) {
        const {
            data: { users },
            error,
        } = await supabase.auth.admin.listUsers({
            page,
            perPage,
        });

        if (error) {
            throw new Error(`Unable to list auth users: ${error.message}`);
        }

        const existingUser = users.find(
            (user) => user.email?.trim().toLowerCase() === email,
        );

        if (existingUser) {
            return existingUser;
        }

        if (users.length < perPage) {
            return null;
        }

        page += 1;
    }
}

async function createOrUpdateAuthUser(seedUser) {
    const existingUser = await findUserByEmail(seedUser.email);

    if (existingUser) {
        const { data, error } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
                password: seedUser.password,
                email_confirm: true,
                user_metadata: {
                    ...(existingUser.user_metadata ?? {}),
                    full_name: seedUser.fullName,
                },
            },
        );

        if (error) {
            throw new Error(
                `Unable to update auth user ${seedUser.email}: ${error.message}`,
            );
        }

        return {
            user: data.user,
            action: "UPDATED",
        };
    }

    const { data, error } = await supabase.auth.admin.createUser({
        email: seedUser.email,
        password: seedUser.password,
        email_confirm: true,
        user_metadata: {
            full_name: seedUser.fullName,
        },
    });

    if (error) {
        throw new Error(
            `Unable to create auth user ${seedUser.email}: ${error.message}`,
        );
    }

    return {
        user: data.user,
        action: "CREATED",
    };
}

async function updateProfile(userId, seedUser) {
    const { data, error } = await supabase
        .from("profiles")
        .update({
            full_name: seedUser.fullName,
            role: seedUser.role,
        })
        .eq("id", userId)
        .select("id, full_name, role")
        .single();

    if (error) {
        throw new Error(
            `Unable to update profile for ${seedUser.email}: ${error.message}`,
        );
    }

    if (data.role !== seedUser.role) {
        throw new Error(
            `Role verification failed for ${seedUser.email}. Expected "${seedUser.role}", received "${data.role}"`,
        );
    }

    return data;
}

async function seed() {
    validateSeedUsers();

    console.log("Wishstead local user seed");
    console.log("=========================\n");

    for (const seedUser of seedUsers) {
        const { user, action } = await createOrUpdateAuthUser(seedUser);

        if (!user?.id) {
            throw new Error(`Auth user ID missing for ${seedUser.email}`);
        }

        const profile = await updateProfile(user.id, seedUser);

        console.log(
            `${action}: ${seedUser.email} | ${profile.full_name} | ${profile.role}`,
        );
    }

    console.log("\nLOCAL USER SEED COMPLETED");
}

seed().catch((error) => {
    console.error("\nLOCAL USER SEED FAILED");
    console.error(error.message);
    process.exit(1);
});