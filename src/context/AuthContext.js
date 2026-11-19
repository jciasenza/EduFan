import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import supabase from "../lib/supabaseClient";

const AuthContext = createContext(undefined);

function createEventId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [pointsSyncError, setPointsSyncError] = useState(false);
  const currentUser = useRef(user);
  currentUser.current = user;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const applySession = (session) => {
      if (!active) return;
      setUser(session?.user || null);
      if (!session?.user) {
        setPoints(0);
        setPointsSyncError(false);
      }
      setLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setPointsSyncError(true);
          setLoading(false);
          return;
        }
        applySession(data.session);
      })
      .catch(() => {
        if (!active) return;
        setPointsSyncError(true);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !user) return undefined;

    let active = true;
    supabase
      .from("profiles")
      .select("total_points")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setPointsSyncError(true);
          return;
        }
        setPoints(Number(data.total_points));
        setPointsSyncError(false);
      })
      .catch(() => {
        if (active) setPointsSyncError(true);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const signUp = useCallback(async (name, email, password) => {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const awardPoint = useCallback(async (gameId) => {
    if (!supabase || !user) return false;

    try {
      const { data, error } = await supabase.rpc("award_point", {
        p_event_id: createEventId(),
        p_game_id: gameId,
      });
      if (error) {
        if (currentUser.current?.id === user.id) setPointsSyncError(true);
        return false;
      }

      if (currentUser.current?.id === user.id) {
        setPoints((currentPoints) => Math.max(currentPoints, Number(data)));
        setPointsSyncError(false);
      }
      return true;
    } catch (awardError) {
      console.error(awardError);
      if (currentUser.current?.id === user.id) setPointsSyncError(true);
      return false;
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    points,
    loading,
    isConfigured: Boolean(supabase),
    pointsSyncError,
    signUp,
    signIn,
    requestPasswordReset,
    updatePassword,
    signOut,
    awardPoint,
  }), [
    user,
    points,
    loading,
    pointsSyncError,
    signUp,
    signIn,
    requestPasswordReset,
    updatePassword,
    signOut,
    awardPoint,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
