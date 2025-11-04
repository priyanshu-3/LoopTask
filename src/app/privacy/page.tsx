export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <p className="text-sm text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              This Privacy Policy describes how LoopTask ("we", "our", or "us") collects, uses, and shares your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, name, and profile information from your authentication provider</li>
              <li><strong>Integration Data:</strong> Activity data from connected services (GitHub, Notion, Slack, Google Calendar)</li>
              <li><strong>Usage Data:</strong> How you interact with our service, including page views and feature usage</li>
              <li><strong>Analytics Data:</strong> Aggregated productivity metrics and insights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our productivity tracking service</li>
              <li>Generate AI-powered insights and analytics</li>
              <li>Sync data from your connected integrations</li>
              <li>Send you notifications about your activity</li>
              <li>Communicate with you about service updates</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data from Integrations</h2>
            <p className="mb-4">When you connect third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>GitHub:</strong> We access your commits, pull requests, and repository activity</li>
              <li><strong>Notion:</strong> We access pages you explicitly share with our integration</li>
              <li><strong>Slack:</strong> We access your messages and channel activity</li>
              <li><strong>Google Calendar:</strong> We access your calendar events and meeting information</li>
            </ul>
            <p className="mt-4">
              We only access data you explicitly authorize and only use it to provide our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>All data is encrypted in transit using HTTPS/TLS</li>
              <li>Access tokens are encrypted at rest using AES-256</li>
              <li>We use secure authentication via OAuth 2.0</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Sharing</h2>
            <p className="mb-4">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., hosting, analytics)</li>
              <li><strong>AI Services:</strong> OpenAI for generating insights (data is anonymized)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Disconnect integrations at any time</li>
              <li>Opt-out of certain data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. When you delete your account or disconnect an integration, we delete the associated data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use tracking cookies for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Children's Privacy</h2>
            <p>
              Our service is not intended for users under 13 years of age. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-4">
              Email: <a href="mailto:support@looptask.com" className="text-blue-400 hover:underline">support@looptask.com</a>
            </p>
          </section>

          <section className="pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              This privacy policy is effective as of {new Date().toLocaleDateString()} and applies to all users of LoopTask.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
