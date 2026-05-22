'use client'
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { logout, setLoading, setUser } from "./(auth)/authSlice";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile } from "@/types/auth-types";
import { usePresence } from "../hooks/usePresence";
import { usePathname, useRouter } from "next/navigation";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  usePresence();

  useEffect(() => {
    const withTimeout = async <T,>(promise: Promise<T>, ms: number, reason: string): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          promise,
          new Promise<T>((_, reject) => {
            timer = setTimeout(() => reject(new Error(reason)), ms);
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    };

    const isPublicRoute = (path: string) => path === "/login" || path === "/signup" || path === "/";

    const resolveRoleFromEmail = (email: string | null) => {
      return email?.toLowerCase() === "admin@gmail.com" ? "admin" : "employee";
    };

    const deletedOrInvalidCodes = new Set([
      "auth/user-not-found",
      "auth/user-disabled",
      "auth/user-token-expired",
      "auth/invalid-user-token",
    ]);

    const forceLogout = async () => {
      try {
        await signOut(auth);
      } catch {
        // no-op
      }

      dispatch(logout());

      if (!isPublicRoute(pathname)) {
        router.replace("/login");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch(setLoading(true));

      try {
        if (firebaseUser) {
          await withTimeout(firebaseUser.reload(), 8000, "auth-reload-timeout");

          const currentUser = auth.currentUser;
          if (!currentUser) {
            await forceLogout();
            return;
          }

          const snap = await withTimeout(getDoc(doc(db, "users", currentUser.uid)), 8000, "user-doc-timeout");

          if (snap.exists()) {
            const userData = snap.data() as UserProfile;
            dispatch(setUser({
              ...userData,
              uid: currentUser.uid,
              email: currentUser.email || "",
              photoURL: userData.photoURL || currentUser.photoURL || undefined,
            }));
          } else {
            // Auth exists but profile not completed yet: keep minimal auth state and send to profile flow.
            dispatch(setUser({
              uid: currentUser.uid,
              email: currentUser.email || "",
              role: resolveRoleFromEmail(currentUser.email),
              isProfileComplete: false,
              photoURL: currentUser.photoURL || undefined,
            }));
          }
        } else {
          dispatch(setUser(null));

          if (!isPublicRoute(pathname)) {
            router.replace("/login");
          }
        }
      } catch (error: unknown) {
        const code = error instanceof FirebaseError ? error.code : "";
        if (deletedOrInvalidCodes.has(code)) {
          await forceLogout();
          return;
        }

        console.error("Auth Init Error:", error);
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    });

    const healthCheck = window.setInterval(async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        await withTimeout(currentUser.reload(), 5000, "health-check-timeout");
      } catch (error: unknown) {
        const code = error instanceof FirebaseError ? error.code : "";
        if (deletedOrInvalidCodes.has(code)) {
          await forceLogout();
        }
      }
    }, 30000);

    return () => {
      unsubscribe();
      window.clearInterval(healthCheck);
    };
  }, [dispatch, pathname, router]);

  return <>{children}</>;
}