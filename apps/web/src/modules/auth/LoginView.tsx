import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { loginSchema, type LoginInput } from "@service-hub/shared";
import { ApiError, signIn } from "../../api";
import { Field } from "../../components/Field";
import { Icon } from "../../components/Icon";
import { HUB_MODULES } from "../../data/modules";
import "../../styles/auth.css";

export function LoginView() {
  const navigate = useNavigate();
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register, handleSubmit, setError, setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const fillAccount = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "ChangeMe123!dev", { shouldValidate: true });
  };

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
      <aside className="auth-panel on-inverse">
        <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" className="brand-wordmark inverse" />
        <div>
          <div className="eyebrow">entervo smart</div>
          <h1 className="display">Service Hub</h1>
          <p className="lead">
            One place to bring customers onto entervo smart and keep every installation patched and secure.
          </p>
        </div>
        <div className="auth-panel-modules">
          {HUB_MODULES.map(m => (
            <div key={m.to} className="auth-panel-module">
              <div className="icon-tile sm"><Icon name={m.icon} size={18} /></div>
              <div>
                <div className="auth-panel-module-title">{m.label}</div>
                <div className="auth-panel-module-desc">{m.highlights[0]}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="auth-form-side">
        <div className="auth-card">
          <div className="eyebrow accent">Welcome</div>
          <h2 className="page-title">Sign in</h2>
          <p className="auth-desc">
            Use the email address and password for your Service Hub account.
          </p>

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
              <div className="callout callout-danger" role="alert">
                <Icon name="alert" size={16} />
                <div>{failure}</div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : <>Sign in <Icon name="arrowRight" /></>}
            </button>
          </form>

          <div className="auth-divider">
            <span>Demo accounts</span>
          </div>

          <div className="auth-demo-accounts">
            <p className="auth-demo-caption">
              Click any role to prefill credentials (all use the same demo password):
            </p>
            <div className="auth-demo-chips">
              <button
                type="button"
                className="chip"
                style={{ fontWeight: 600 }}
                onClick={() => fillAccount("manager@scheidt-bachmann.de")}
              >
                Project Manager
              </button>
              <button
                type="button"
                className="chip"
                style={{ fontWeight: 600 }}
                onClick={() => fillAccount("sales@scheidt-bachmann.de")}
              >
                Sales Team
              </button>
              <button
                type="button"
                className="chip"
                style={{ fontWeight: 600 }}
                onClick={() => fillAccount("devops@scheidt-bachmann.de")}
              >
                DevOps
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => fillAccount("admin@scheidt-bachmann.de")}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
