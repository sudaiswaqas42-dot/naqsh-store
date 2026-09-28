"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-md w-full flex flex-col items-center bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
      data-testid="register-page"
    >
      <span className="text-[10px] uppercase font-sans font-semibold tracking-[0.25em] text-accent mb-2">
        Bespoke Access
      </span>
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide uppercase text-stone-900 mb-2">
        Join NAQSH
      </h1>
      <p className="text-center text-xs sm:text-sm text-stone-500 mb-6 leading-relaxed max-w-xs">
        Create your account to unlock private seasonal collections, personalized tailoring services, and priority shipping.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-xs text-stone-700 bg-amber-50 border border-amber-200/80 rounded-lg p-4"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
            />
            <Input
              label="Last Name"
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="last-name-input"
            />
          </div>
          <Input
            label="Email Address"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone (e.g. +92 300 1234567)"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="text-center text-stone-400 text-[11px] leading-relaxed mt-5">
          By creating an account, you agree to NAQSH&apos;s{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="text-stone-700 underline underline-offset-2 hover:text-accent"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/terms-of-use"
            className="text-stone-700 underline underline-offset-2 hover:text-accent"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton
          className="w-full mt-6 bg-stone-900 hover:bg-black text-white text-xs tracking-[0.2em] uppercase py-3.5 rounded-lg transition-all duration-200 shadow-sm"
          data-testid="register-button"
        >
          Create Account
        </SubmitButton>
      </form>
      <div className="mt-8 pt-6 border-t border-stone-100 w-full text-center">
        <span className="text-xs text-stone-500">
          Already have an account?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="text-stone-900 font-semibold underline underline-offset-4 hover:text-accent transition-colors ml-1"
          >
            Sign In
          </button>
        </span>
      </div>
    </div>
  )
}

export default Register
