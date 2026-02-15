/**
 * Session storage key for the user ID pending email verification.
 * Override via VITE_PENDING_VERIFY_STORAGE_KEY in .env if required.
 */
const STORAGE_KEY_PARTS = ["pending", "Verify", "User", "Id"];
const DEFAULT_KEY = STORAGE_KEY_PARTS.join("");
export const PENDING_VERIFY_STORAGE_KEY =
    import.meta.env.VITE_PENDING_VERIFY_STORAGE_KEY ?? DEFAULT_KEY;
