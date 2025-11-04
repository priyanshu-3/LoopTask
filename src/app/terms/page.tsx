export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <p className="text-sm text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              These Terms of Service ("Terms") govern your access to and use of LoopTask ("Service", "we", "our", or "us"). By using our Service, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using LoopTask, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p className="mb-4">LoopTask provides:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Productivity tracking across multiple platforms (GitHub, Notion, Slack, Google Calendar)</li>
              <li>AI-powered analytics and insights</li>
              <li>Activity aggregation and visualization</li>
              <li>Team collaboration features</li>
              <li>Workflow automation tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
            <p className="mb-4">To use our Service, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 13 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activity under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Third-Party Integrations</h2>
            <p className="mb-4">When connecting third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You authorize us to access data from those services</li>
              <li>You must comply with the terms of service of those platforms</li>
              <li>We are not responsible for the availability or functionality of third-party services</li>
              <li>You can disconnect integrations at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Acceptable Use</h2>
            <p className="mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Scrape or harvest data from the Service</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Intellectual Property</h2>
            <p>
              The Service, including its design, features, and content, is owned by LoopTask and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. User Content</h2>
            <p className="mb-4">Regarding data you provide:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain ownership of your data</li>
              <li>You grant us a license to use your data to provide the Service</li>
              <li>You are responsible for the accuracy of your data</li>
              <li>You can export or delete your data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Fees and Payment</h2>
            <p>
              Some features may require payment. If you subscribe to a paid plan:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Fees are charged in advance on a recurring basis</li>
              <li>You authorize us to charge your payment method</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>We may change fees with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Service Availability</h2>
            <p>
              We strive to provide reliable service, but we do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Uninterrupted or error-free operation</li>
              <li>That defects will be corrected</li>
              <li>That the Service is free from viruses or harmful components</li>
            </ul>
            <p className="mt-4">
              We may modify, suspend, or discontinue the Service at any time with notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Termination</h2>
            <p className="mb-4">We may terminate or suspend your account if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You violate these Terms</li>
              <li>You engage in fraudulent activity</li>
              <li>Required by law</li>
              <li>Your account is inactive for an extended period</li>
            </ul>
            <p className="mt-4">
              You may terminate your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">13. Indemnification</h2>
            <p>
              You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of your jurisdiction, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">15. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes via email or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">16. Contact Information</h2>
            <p>
              For questions about these Terms, contact us at:
            </p>
            <p className="mt-4">
              Email: <a href="mailto:support@looptask.com" className="text-blue-400 hover:underline">support@looptask.com</a>
            </p>
          </section>

          <section className="pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              By using LoopTask, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
