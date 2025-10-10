import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  CircularProgress,
} from "@mui/material";

const API = import.meta.env.VITE_API_URL as string; // ej: "http://localhost:4000"

// --- Tipos de estado del wizard
 type Step = "email" | "pin" | "reset" | "done";

// --- Helpers
function isValidEmail(v: string) {
  return /[^@\s]+@[^@\s]+\.[^@\s]+/.test(v);
}

const SS_KEYS = {
  step: "recover.step",
  email: "recover.email",
  requestId: "recover.requestId",
};

export default function RecoverPassword() {
  // --- Estado
  const [step, setStep] = useState<Step>(() =>
    (sessionStorage.getItem(SS_KEYS.step) as Step) || "email"
  );
  const [email, setEmail] = useState(() => sessionStorage.getItem(SS_KEYS.email) || "");
  const [requestId, setRequestId] = useState(() => sessionStorage.getItem(SS_KEYS.requestId) || "");
  const [pin, setPin] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // --- Reenvío con cooldown
  const DEFAULT_COOLDOWN = 60; // segundos
  const [cooldown, setCooldown] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (cooldown <= 0 && timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    if (cooldown > 0 && !timerRef.current) {
      timerRef.current = window.setInterval(() => setCooldown((s) => s - 1), 1000);
    }
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cooldown]);

  // --- Persistir step/email/requestId para sobrevivir refresh
  useEffect(() => {
    sessionStorage.setItem(SS_KEYS.step, step);
  }, [step]);
  useEffect(() => {
    email ? sessionStorage.setItem(SS_KEYS.email, email) : sessionStorage.removeItem(SS_KEYS.email);
  }, [email]);
  useEffect(() => {
    requestId
      ? sessionStorage.setItem(SS_KEYS.requestId, requestId)
      : sessionStorage.removeItem(SS_KEYS.requestId);
  }, [requestId]);

  // --- Reset de mensajes al cambiar de paso
  useEffect(() => {
    setError(null);
    setInfo(null);
  }, [step]);

  // --- UI helpers
  const canSubmitEmail = useMemo(() => isValidEmail(email), [email]);
  const canSubmitPin = useMemo(() => pin.trim().length >= 6 && requestId.trim().length > 0, [pin, requestId]);
  const passwordOk = useMemo(() => newPassword.length >= 8 && newPassword === confirmPassword, [newPassword, confirmPassword]);

  // --- API helpers
  async function postJSON<T = any>(
    url: string,            // puede ser "/auth/forgot-password" o una URL absoluta
    body?: unknown,
    init?: RequestInit
  ): Promise<T> {
    // Si te pasan un path, préfix con API; si ya viene absoluta, úsala tal cual.
    const isAbsolute = /^https?:\/\//i.test(url);
    const fullUrl = isAbsolute ? url : `${API}${url}`;

    const res = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      body: JSON.stringify(body ?? {}),
      credentials: "include",
      ...init,
    });

    // intenta parsear JSON; si falla, cae a texto
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      try {
        data = await res.text();
      } catch {}
    }

    if (!res.ok) {
      const detail =
        (data && (data.error || data.message)) ||
        `Request failed: ${res.status}`;
      throw new Error(detail);
    }

    return (data ?? {}) as T;
  }

    // Paso 1: enviar email
  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitEmail) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const data = await postJSON<{ message?: string; requestId?: string }>(
        "/auth/forgot-password",
        { email: normalizedEmail }
      );

      if (data?.requestId) setRequestId(data.requestId);

      setInfo("Si el correo existe, te enviamos un PIN. Revisa tu bandeja de entrada y spam.");
      setStep("pin");
      setCooldown(DEFAULT_COOLDOWN);
    } catch (err: any) {
      setError(err.message || "No fue posible iniciar el proceso. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Paso 2: verificar PIN
  async function handleVerifyPin(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitPin) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const normalizedRequestId = requestId.trim();
      const cleanedPin = pin.replace(/\s+/g, "").trim(); // quita espacios internos

      const data = await postJSON<{ resetToken: string }>(
        "/auth/verify-pin",
        { requestId: normalizedRequestId, pin: cleanedPin }
      );

      setResetToken(data.resetToken);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "PIN inválido o expirado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || !requestId) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const normalizedRequestId = requestId.trim();

      await postJSON<{ message: string }>(
        "/auth/resend-pin",
        { requestId: normalizedRequestId }
      );

      setInfo("Te enviamos un nuevo PIN.");
      setCooldown(DEFAULT_COOLDOWN);
    } catch (err: any) {
      setError(err.message || "No se pudo reenviar. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  // Paso 3: resetear contraseña
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordOk || !resetToken) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      // No hagas trim del password: podría ser parte válida
      await postJSON(
        "/auth/reset-password",
        { resetToken, newPassword }
      );

      // limpiar sessionStorage
      sessionStorage.removeItem(SS_KEYS.step);
      sessionStorage.removeItem(SS_KEYS.email);
      sessionStorage.removeItem(SS_KEYS.requestId);

      setStep("done");
    } catch (err: any) {
      setError(err.message || "El token expiró o no es válido.");
    } finally {
      setLoading(false);
    }
  }

  // --- Render
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", p: 2 }}>
      <Box sx={{ width: 420, bgcolor: "background.paper", p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Recuperar contraseña
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {error}
          </Alert>
        )}
        {info && (
          <Alert severity="info" sx={{ mb: 2 }} role="status">
            {info}
          </Alert>
        )}

        {step === "email" && (
          <form onSubmit={handleSendEmail}>
            <TextField
              label="Email"
              fullWidth
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!canSubmitEmail || loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={22} /> : "Enviar PIN"}
            </Button>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                ¿Recordaste tu contraseña? {" "}
                <Link href="/login" underline="hover">Inicia sesión</Link>
              </Typography>
            </Box>
          </form>
        )}

        {step === "pin" && (
          <form onSubmit={handleVerifyPin}>
            {!requestId && (
              <TextField
                label="ID de solicitud"
                fullWidth
                margin="normal"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                helperText="Revisa tu correo: viene junto al PIN"
              />
            )}
            <TextField
              label="PIN de 6 dígitos"
              fullWidth
              margin="normal"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 6 }}
            />
            <Button type="submit" variant="contained" fullWidth disabled={!canSubmitPin || loading} sx={{ mt: 1 }}>
              {loading ? <CircularProgress size={22} /> : "Verificar PIN"}
            </Button>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button onClick={handleResend} disabled={cooldown > 0 || !requestId || loading} variant="text">
                Reenviar PIN {cooldown > 0 ? `(${cooldown}s)` : ""}
              </Button>
              <Link href="/login" underline="hover">Volver a iniciar sesión</Link>
            </Box>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset}>
            <TextField
              label="Nueva contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Mínimo 8 caracteres"
            />
            <TextField
              label="Confirmar contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword.length > 0 && confirmPassword !== newPassword}
              helperText={confirmPassword && confirmPassword !== newPassword ? "Las contraseñas no coinciden" : " "}
            />
            <Button type="submit" variant="contained" fullWidth disabled={!passwordOk || loading} sx={{ mt: 1 }}>
              {loading ? <CircularProgress size={22} /> : "Cambiar contraseña"}
            </Button>
          </form>
        )}

        {step === "done" && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Tu contraseña fue actualizada correctamente.
            </Alert>
            <Button component={Link as any} href="/login" variant="contained" fullWidth>
              Ir a iniciar sesión
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
