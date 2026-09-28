import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-md w-full flex flex-col items-center bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
      data-testid="login-page"
    >
      <span className="text-[10px] uppercase font-sans font-semibold tracking-[0.25em] text-accent mb-2">
        Client Privilege
      </span>
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide uppercase text-stone-900 mb-2">
        Welcome Back
      </h1>
      <p className="text-center text-xs sm:text-sm text-stone-500 mb-8 leading-relaxed max-w-xs">
        Sign in to access your bespoke orders, curated wishlist, and luxury shopping experience.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-xs text-stone-700 bg-amber-50 border border-amber-200/80 rounded-lg p-4"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6 bg-stone-900 hover:bg-black text-white text-xs tracking-[0.2em] uppercase py-3.5 rounded-lg transition-all duration-200 shadow-sm"
        >
          Sign In
        </SubmitButton>
      </form>
      <div className="mt-8 pt-6 border-t border-stone-100 w-full text-center">
        <span className="text-xs text-stone-500">
          Not a member yet?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="text-stone-900 font-semibold underline underline-offset-4 hover:text-accent transition-colors ml-1"
            data-testid="register-button"
          >
            Create an Account
          </button>
        </span>
      </div>
    </div>
  )
}

export default Login
