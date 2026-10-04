import logo from "../assets/naqsh-logo.png"

const BrandLogo = () => (
  <div style={{ background: "white", display: "flex", justifyContent: "center", borderRadius: 8 }}>
    <img src={logo} alt="NAQSH — Where Identity Begins" style={{ width: 210, height: 140, objectFit: "contain" }} />
  </div>
)

export default BrandLogo
