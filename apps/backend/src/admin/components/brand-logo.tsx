import logo from "../assets/naqsh-logo.png"
import lightLogo from "../assets/naqsh-logo-light.png"
import "../styles/brand.css"

export default function BrandLogo() {
  return (
    <div className="flex justify-center rounded-lg bg-ui-bg-base p-5">
      <img src={logo} alt="NAQSH" className="block h-20 w-auto max-w-[280px] object-contain dark:hidden" />
      <img src={lightLogo} alt="NAQSH" className="hidden h-20 w-auto max-w-[280px] object-contain dark:block" />
    </div>
  )
}
