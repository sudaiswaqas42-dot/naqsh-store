import { Metadata } from "next"
import NaqshLogo from "@modules/common/components/naqsh-logo"

export const metadata: Metadata = {
  title: "Privacy Policy — NAQSH",
  description:
    "Review the official Privacy Policy of NAQSH. Learn how we collect, use, protect, and handle your personal data when shopping with us across Pakistan.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] font-sans py-14 sm:py-20">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex justify-center mb-2">
            <NaqshLogo variant="dark" size="md" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B6975A]">
            Legal & Compliance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#0F2D22] font-medium">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Last Updated: January 2025
          </p>
        </div>

        {/* Intro */}
        <div className="bg-white p-6 sm:p-8 border border-stone-200 shadow-2xs mb-10 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-4">
          <p>
            At <strong>NAQSH</strong>, we respect your privacy and are committed to protecting the personal information you provide when using our website and shopping with us.
          </p>
          <p>
            This Privacy Policy explains what information we collect, how we use it, when it may be shared, and the choices available to you when you visit our website, create an account, place an order, or contact us.
          </p>
          <p className="font-medium text-stone-900">
            By using our website, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>

        {/* 14 Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              1. Information We Collect
            </h2>
            <p>
              When you use our website, we may collect information that is necessary to provide our services and process your orders. This may include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li>Full name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Delivery address</li>
              <li>Billing information</li>
              <li>Account login information</li>
              <li>Order and purchase history</li>
              <li>Product preferences and interactions with our website</li>
              <li>Information you provide when contacting customer support</li>
              <li>Any other information you voluntarily provide to us</li>
            </ul>
            <p className="pt-2 text-stone-500 text-xs">
              We may also automatically collect certain technical information when you visit our website, such as IP address, browser type, device information, operating system, pages visited, and general website usage data.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              2. How We Use Your Information
            </h2>
            <p>We may use the information collected from you to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li>Process and confirm your orders</li>
              <li>Arrange delivery to your provided address</li>
              <li>Contact you regarding your order</li>
              <li>Provide customer support</li>
              <li>Manage your account</li>
              <li>Process payments where applicable</li>
              <li>Handle returns, exchanges, refunds, and order-related requests</li>
              <li>Improve our website, products, and services</li>
              <li>Understand customer preferences and website usage</li>
              <li>Send important service-related notifications</li>
              <li>Send promotional communications where permitted and where you have provided consent</li>
              <li>Prevent fraudulent, unauthorized, or potentially harmful activities</li>
              <li>Comply with applicable legal and regulatory requirements</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              3. Order and Delivery Information
            </h2>
            <p>
              When you place an order, we need certain personal information to complete the transaction and deliver your products. Your name, phone number, delivery address, and relevant order details may be shared with delivery or logistics partners when necessary to fulfil your order.
            </p>
            <p className="text-stone-500 text-xs">
              We only provide information that is reasonably required for the delivery or service being provided.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              4. Payment Information
            </h2>
            <p>
              Depending on the payment methods available on our website, you may provide payment-related information when completing a purchase. Where third-party payment services are used, payment information may be processed directly by the relevant payment provider according to its own privacy policy and security practices.
            </p>
            <p>
              We do not intentionally collect or store sensitive payment credentials such as complete card passwords, PINs, or security codes unless specifically required and lawfully permitted for the relevant payment process.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              5. Cookies and Similar Technologies
            </h2>
            <p>
              Our website may use cookies and similar technologies to improve website functionality and provide a better shopping experience. Cookies may help us:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Remember shopping preferences</li>
              <li>Keep products in your shopping cart</li>
              <li>Maintain login sessions</li>
              <li>Understand website traffic and usage</li>
              <li>Improve website performance</li>
              <li>Provide relevant website features</li>
              <li>Analyze the effectiveness of marketing activities</li>
            </ul>
            <p className="text-stone-500 text-xs pt-1">
              You can manage or disable cookies through your browser settings. However, disabling certain cookies may affect some website functionality.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              6. How We Protect Your Information
            </h2>
            <p>
              We take reasonable technical and organizational measures to protect personal information against unauthorized access, misuse, alteration, disclosure, or loss.
            </p>
            <p className="text-stone-500 text-xs">
              However, no method of transmitting or storing information online can be guaranteed to be completely secure. Therefore, while we take reasonable precautions, we cannot guarantee absolute security of information transmitted through the internet.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              7. Sharing of Personal Information
            </h2>
            <p>
              We do not sell or rent your personal information to third parties. Information may be shared with trusted service providers when necessary to operate our business, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Delivery and logistics companies</li>
              <li>Payment service providers</li>
              <li>Website hosting and technology providers</li>
              <li>Customer support or communication service providers</li>
              <li>Analytics and marketing service providers, where applicable</li>
              <li>Legal, regulatory, or government authorities when required by law</li>
            </ul>
            <p className="text-stone-500 text-xs pt-1">
              Third-party service providers are expected to handle information appropriately and only for the purposes for which it is provided.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              8. Marketing Communications
            </h2>
            <p>
              We may use your contact information to provide promotional updates, offers, new collection announcements, or other marketing communications where permitted by applicable law.
            </p>
            <p>
              You may request to stop receiving promotional communications by using the available unsubscribe option or contacting us directly. Please note that you may still receive essential communications related to your account, orders, payments, deliveries, returns, or other services.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              9. Third-Party Services and Websites
            </h2>
            <p>
              Our website may contain links, integrations, payment options, social media features, or other services operated by third parties. These third parties may have their own privacy policies and terms of use. We are not responsible for the privacy practices of external websites or services that we do not operate. We recommend reviewing the privacy policies of third-party services before providing them with personal information.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              10. Children's Privacy
            </h2>
            <p>
              Our website is intended for general consumers and is not specifically directed toward children. We do not knowingly collect personal information from children where such collection is prohibited by applicable law. If you believe that a child has provided personal information to us without appropriate permission, please contact us so that we can review and take appropriate action.
            </p>
          </section>

          {/* Section 11 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              11. Data Retention
            </h2>
            <p>
              We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including order processing, customer support, business records, dispute resolution, fraud prevention, and compliance with applicable legal requirements. When information is no longer required, we may securely delete, anonymize, or otherwise dispose of it where appropriate.
            </p>
          </section>

          {/* Section 12 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              12. Your Privacy Rights
            </h2>
            <p>
              Depending on applicable laws and circumstances, you may have rights regarding your personal information, which may include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Requesting access to information we hold about you</li>
              <li>Requesting correction of inaccurate information</li>
              <li>Requesting deletion of certain information</li>
              <li>Requesting restriction of certain processing</li>
              <li>Withdrawing consent where processing is based on consent</li>
              <li>Opting out of certain marketing communications</li>
            </ul>
            <p className="text-stone-500 text-xs pt-1">
              To make a privacy-related request, please contact us using the contact details provided below.
            </p>
          </section>

          {/* Section 13 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              13. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our services, website, business practices, or applicable legal requirements. When changes are made, the updated version will be published on this page with a revised "Last Updated" date. We encourage you to review this page periodically to stay informed about how we handle personal information.
            </p>
          </section>

          {/* Section 14 */}
          <section className="p-8 bg-[#0F2D22] text-[#FAF9F6] border border-[#081B14] space-y-4">
            <h2 className="font-serif text-2xl text-white font-medium">
              14. Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
              If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your personal information, please contact us:
            </p>
            <div className="pt-2 space-y-2 text-xs sm:text-sm font-light">
              <div>
                <strong className="text-[#B6975A] font-semibold">Store:</strong> NAQSH
              </div>
              <div>
                <strong className="text-[#B6975A] font-semibold">Email:</strong>{" "}
                <a href="mailto:info@naqsh.pk" className="underline hover:text-white">
                  info@naqsh.pk
                </a>
              </div>
              <div>
                <strong className="text-[#B6975A] font-semibold">Phone / WhatsApp:</strong>{" "}
                <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="underline hover:text-white">
                  +92 300 1234567
                </a>
              </div>
              <div>
                <strong className="text-[#B6975A] font-semibold">Website:</strong>{" "}
                <span className="font-mono text-stone-200">https://naqsh.pk</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
