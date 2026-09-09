import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ApiError, signIn } from "../../api";
import { Field } from "../../components/Field";
import { Icon } from "../../components/Icon";
import "../../styles/auth.css";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address")
    .pipe(z.email("Enter a valid email address")),
});

type LoginForm = z.infer<typeof loginSchema>;

const route = getRouteApi("/login");

export function LoginView() {
  const directory = route.useLoaderData();
  const navigate = useNavigate();
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register, handleSubmit, setError, setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  /**
   * A rejection comes back as a 422 or 401 carrying per-field messages, and
   * they are handed straight to the field that produced them — so a server
   * message lands in the same slot as a client-side one, never stacking.
   */
  const onSubmit = handleSubmit(async ({ email }) => {
    setFailure(null);
    try {
      await signIn(email);
      await navigate({ to: "/" });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors?.email) {
        setError("email", { message: error.fieldErrors.email });
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
          Enter the email address your Service Hub account is registered under.
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

          {failure && (
            <div className="error-msg" role="alert" style={{ marginTop: 10 }}>⚠ {failure}</div>
          )}

          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : <>Continue <Icon name="chevronRight" /></>}
          </button>
        </form>

        <div className="auth-note">
          <strong>Identity only.</strong> There is no server yet, so this confirms who you
          are without proving it. It is not a security boundary and will be replaced by
          single sign-on. Any known address signs in:
          <ul className="auth-hint-list">
            {directory.map((user) => (
              <li key={user.id}>
                <button type="button" onClick={() => setValue("email", user.email, { shouldValidate: true })}>
                  {user.email}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
