import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, getRouteApi } from "@tanstack/react-router";
import { passwordSchema } from "@service-hub/shared";
import { ApiError, activateAccount, getActivation } from "../../api";
import { Field } from "../../components/Field";
import { Icon } from "../../components/Icon";
import "../../styles/auth.css";

const route = getRouteApi("/activate");

const activateSchema = z.object({
  password: passwordSchema,
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords don't match" });

type ActivateInput = z.infer<typeof activateSchema>;

/**
 * Where an invitation link lands: the new person chooses their password, and
 * the account becomes active. The token in the link is the only credential.
 */
export function ActivateView() {
  const { token } = route.useSearch();
  const [account, setAccount] = useState<{ email: string; name: string } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ActivateInput>({
    resolver: zodResolver(activateSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    let live = true;
    getActivation(token ?? "")
      .then((result) => { if (live) setAccount(result); })
      .catch((error: unknown) => { if (live) setLinkError(error instanceof Error ? error.message : "This link can't be used."); });
    return () => { live = false; };
  }, [token]);

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      await activateAccount(token ?? "", password);
      setDone(true);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors?.password) {
        setError("password", { message: error.fieldErrors.password });
      } else {
        setLinkError(error instanceof Error ? error.message : "Activation failed");
      }
    }
  });

  return (
    <div className="auth-root single">
      <main className="auth-form-side">
        <div className="auth-card">
          <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" className="brand-wordmark auth-card-logo" />
          <div className="eyebrow accent">entervo Service Hub</div>
          <h2 className="page-title">Activate your account</h2>

          {linkError && (
            <div className="callout callout-danger" role="alert">
              <Icon name="alert" size={16} /><div>{linkError}</div>
            </div>
          )}

          {!linkError && !account && <p className="auth-desc">Checking your invitation link…</p>}

          {done && (
            <>
              <div className="callout callout-success" role="status">
                <Icon name="check" size={16} /><div>Your account is active. Sign in with {account?.email} and your new password.</div>
              </div>
              <Link to="/login" className="btn btn-primary btn-lg btn-block auth-submit">Go to sign in <Icon name="arrowRight" /></Link>
            </>
          )}

          {account && !done && !linkError && (
            <form onSubmit={onSubmit} noValidate>
              <p className="auth-desc">Welcome, {account.name}. Choose a password for <strong>{account.email}</strong>.</p>
              <Field label="New password" required hint="At least 12 characters, with upper- and lower-case letters and a digit" error={errors.password?.message}>
                <input {...register("password")} type="password" autoComplete="new-password" autoFocus
                  className={`form-input${errors.password ? " error" : ""}`} />
              </Field>
              <Field label="Repeat password" required error={errors.confirm?.message}>
                <input {...register("confirm")} type="password" autoComplete="new-password"
                  className={`form-input${errors.confirm ? " error" : ""}`} />
              </Field>
              <button type="submit" className="btn btn-primary btn-lg btn-block auth-submit" disabled={isSubmitting}>
                {isSubmitting ? "Activating…" : <>Activate account <Icon name="arrowRight" /></>}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
