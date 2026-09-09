import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { loginSchema, type LoginInput } from "@service-hub/shared";
import { ApiError, signIn } from "../../api";
import { Field } from "../../components/Field";
import { Icon } from "../../components/Icon";
import "../../styles/auth.css";

export function LoginView() {
  const navigate = useNavigate();
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register, handleSubmit, setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  /**
   * A rejection arrives as a 401 or 422 carrying per-field messages, which are
   * handed to the field that produced them — so a server message lands in the
   * same slot as a client-side one and the two never stack.
   *
   * The server deliberately gives the same answer for a wrong password and an
   * unknown address, so this cannot be used to find out who has an account.
   */
  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFailure(null);
    try {
      await signIn(email, password);
      await navigate({ to: "/" });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field === "email" || field === "password") setError(field, { message });
        }
        if (!error.fieldErrors.email && !error.fieldErrors.password) setFailure(error.message);
        return;
      }
      setFailure(error instanceof Error ? error.message : "Sign-in failed");
    }
  });

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" />
          <div className="auth-brand-divider" />
          <div>
            <div className="auth-brand-text">entervo smart</div>
            <div className="auth-brand-sub">Service Hub</div>
          </div>
        </div>

        <div className="auth-title">Sign in</div>
        <div className="auth-desc">
          Use the email address and password for your Service Hub account.
        </div>

        <form onSubmit={onSubmit} noValidate>
          <Field label="Email address" required error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              autoComplete="username"
              autoFocus
              placeholder="name@scheidt-bachmann.de"
              className={`form-input${errors.email ? " error" : ""}`}
            />
          </Field>

          <Field label="Password" required error={errors.password?.message}>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              className={`form-input${errors.password ? " error" : ""}`}
            />
          </Field>

          {failure && (
            <div className="error-msg" role="alert" style={{ marginTop: 10 }}>⚠ {failure}</div>
          )}

          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : <>Sign in <Icon name="chevronRight" /></>}
          </button>
        </form>

        <div className="auth-note">
          <Icon name="lock" size={12} /> <strong>Single sign-on</strong> replaces this screen once
          the identity provider is connected. Accounts, roles and permissions stay where they are —
          only how you prove who you are changes.
        </div>
      </div>
    </div>
  );
}
