"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldAlert } from "lucide-react";
import { loginCeo } from "./actions";

const initialState = { errors: {}, message: "" };

export function CeoLoginForm() {
  const [state, formAction, pending] = useActionState(loginCeo, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      {state?.message && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300 backdrop-blur-sm"
          role="alert"
        >
          <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" />
          <span>{state.message}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="ceo-email"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Authorized Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="ceo-email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            placeholder="admin@rootixa.com"
            className={`w-full rounded-xl border bg-slate-900/90 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
              state?.errors?.email ? "border-red-500/50" : "border-slate-800"
            }`}
          />
        </div>
        {state?.errors?.email && (
          <p className="mt-1 text-xs text-red-400">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="ceo-password"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Keyphrase / Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="ceo-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
            className={`w-full rounded-xl border bg-slate-900/90 py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
              state?.errors?.password ? "border-red-500/50" : "border-slate-800"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state?.errors?.password && (
          <p className="mt-1 text-xs text-red-400">{state.errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-slate-400">
          <input
            name="remember"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-indigo-600 cursor-pointer"
          />
          Maintain secure session
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-4 shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {pending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <span>Authenticate & Access</span>
        )}
      </button>
    </form>
  );
}
