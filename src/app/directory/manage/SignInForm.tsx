"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/directory/FormField";
import { requestSignInLink, type SignInState } from "./actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestSignInLink, {});

  if (state.sent) {
    return (
      <div role="status" className="rounded-2xl border border-navy/15 bg-white p-6">
        <p className="font-serif text-2xl font-semibold text-navy">Check your email</p>
        <p className="mt-2 leading-7 text-slate">
          If <strong className="font-semibold text-navy">{state.email}</strong> has a listing, we just sent it a sign-in link. It works once and expires in 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormField id="signin-email" label="Email" error={state.error} hint="The email you used when you signed up.">
        <input
          id="signin-email"
          name="email"
          type="email"
          defaultValue={state.email}
          required
          autoComplete="email"
          className={inputClass}
          aria-describedby="signin-email-help"
          aria-invalid={state.error ? true : undefined}
        />
      </FormField>
      <button type="submit" disabled={pending} className="btn-primary min-h-12 justify-self-start disabled:opacity-60">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
