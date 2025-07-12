export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-newsreader text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 15, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-muted/30 p-6 rounded-lg mb-8">
              <p className="text-base text-muted-foreground mb-0">
                Welcome to News Briefing. These Terms of Service (&quot;Terms&quot;) govern your use of our news aggregation and briefing service. By accessing or using our service, you agree to be bound by these Terms.
              </p>
            </div>

            <section className="space-y-6">
              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">1. Service Description</h2>
                <p className="text-muted-foreground mb-4">
                  News Briefing is an AI-powered news aggregation platform that provides personalized daily news briefings. Our service includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Personalized news briefings based on your selected sources</li>
                  <li>AI-generated summaries of news articles</li>
                  <li>Text and audio format briefings</li>
                  <li>Community news source sharing</li>
                  <li>Email delivery of daily briefings</li>
                  <li>Historical briefing access (up to 30 days)</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">2. User Accounts</h2>
                <p className="text-muted-foreground mb-4">
                  To use our service, you must create an account by providing accurate and complete information. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Maintaining the security of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Providing accurate and up-to-date information</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">3. Subscription Plans</h2>
                <p className="text-muted-foreground mb-4">
                  Our service offers different subscription tiers:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>7-day Free Trial:</strong> Access to up to 5 news sources with daily text briefings</li>
                  <li><strong>Pro Plan ($7.99/month):</strong> Up to 30 news sources with 15-day history</li>
                  <li><strong>Max Plan ($11.99/month):</strong> Up to 50 news sources with audio briefings and email delivery</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Subscription fees are billed monthly and are non-refundable except as required by law.
                </p>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">4. User Conduct</h2>
                <p className="text-muted-foreground mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the service</li>
                  <li>Share false, misleading, or inappropriate news sources</li>
                  <li>Use automated tools to access the service without permission</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">5. Content and Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  Our service aggregates content from various news sources. We do not own the original news content but provide AI-generated summaries for your convenience. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Original news content belongs to its respective publishers</li>
                  <li>Our AI-generated summaries are provided for informational purposes</li>
                  <li>You may not redistribute our summaries commercially without permission</li>
                  <li>We respect intellectual property rights and comply with fair use principles</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">6. Privacy and Data Protection</h2>
                <p className="text-muted-foreground mb-4">
                  We collect and process personal information as described in our Privacy Policy. By using our service, you consent to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Collection of your news preferences and reading habits</li>
                  <li>Processing of your data to personalize news briefings</li>
                  <li>Storage of your briefing history for up to 30 days</li>
                  <li>Use of cookies and similar technologies for service improvement</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">7. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground mb-4">
                  Our service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>The accuracy or completeness of news summaries</li>
                  <li>Uninterrupted or error-free service</li>
                  <li>The availability of any particular news source</li>
                  <li>That our AI summaries will meet your specific needs</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  To the maximum extent permitted by law, News Briefing and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
                </p>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">9. Termination</h2>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your account at any time for violations of these Terms. You may cancel your subscription at any time through your account settings. Upon termination:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Your access to paid features will cease immediately</li>
                  <li>Your data may be deleted after 30 days</li>
                  <li>You remain responsible for any outstanding fees</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or through our service. Your continued use of the service after such changes constitutes acceptance of the new Terms.
                </p>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">11. Governing Law</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms are governed by and construed in accordance with the laws of the jurisdiction where News Briefing operates. Any disputes arising under these Terms shall be resolved through binding arbitration.
                </p>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">12. Privacy Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
                </p>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">12.1 Information We Collect</h3>
                <p className="text-muted-foreground mb-4">
                  We collect the following types of information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li><strong>Account Information:</strong> Email address, name, and authentication details</li>
                  <li><strong>Usage Data:</strong> News source preferences, reading habits, and briefing history</li>
                  <li><strong>Technical Data:</strong> IP address, device information, and browser details</li>
                  <li><strong>Communication Data:</strong> Messages sent to our support team</li>
                </ul>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">12.2 How We Use Your Information</h3>
                <p className="text-muted-foreground mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Provide personalized news briefings based on your preferences</li>
                  <li>Generate AI-powered summaries tailored to your interests</li>
                  <li>Deliver briefings via email and in-app notifications</li>
                  <li>Improve our service through usage analytics</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Process payments and manage subscriptions</li>
                </ul>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">12.3 Data Sharing and Third Parties</h3>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share your data with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li><strong>Service Providers:</strong> Third parties who help us operate our service (e.g., hosting, analytics)</li>
                  <li><strong>Payment Processors:</strong> Stripe for handling subscription payments</li>
                  <li><strong>AI Services:</strong> OpenAI and similar providers for content summarization</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">12.4 Data Security and Retention</h3>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures to protect your data. Your briefing history is stored for up to 30 days, and account information is retained while your account is active and for a reasonable period after deletion.
                </p>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">12.5 Your Rights</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of certain data processing activities</li>
                  <li>Export your data in a portable format</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">13. Refund Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We strive to provide excellent service, but we understand that our service may not be suitable for everyone. This Refund Policy outlines our approach to refunds and cancellations.
                </p>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">13.1 Free Trial Period</h3>
                <p className="text-muted-foreground mb-4">
                  We offer a 7-day free trial for new users. During this period, you can:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Access up to 5 news sources</li>
                  <li>Receive daily text briefings</li>
                  <li>Cancel at any time without charge</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  No refund is necessary during the free trial period as no payment is required.
                </p>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">13.2 Subscription Cancellation</h3>
                <p className="text-muted-foreground mb-4">
                  You may cancel your subscription at any time through:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Your account settings on our website</li>
                  <li>Contacting our support team</li>
                  <li>Your payment provider (e.g., Stripe customer portal)</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  Upon cancellation, you will continue to have access to paid features until the end of your current billing period.
                </p>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">13.3 Refund Eligibility</h3>
                <p className="text-muted-foreground mb-4">
                  We generally do not provide refunds for subscription fees. However, we may consider refunds in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li><strong>Technical Issues:</strong> If our service experiences significant downtime or technical problems</li>
                  <li><strong>Billing Errors:</strong> If you were charged incorrectly due to our error</li>
                  <li><strong>Exceptional Circumstances:</strong> At our discretion, based on individual cases</li>
                </ul>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">13.4 Refund Process</h3>
                <p className="text-muted-foreground mb-4">
                  To request a refund:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Contact our support team at support@newsbriefing.app</li>
                  <li>Provide your account details and reason for the refund request</li>
                  <li>Allow 5-7 business days for review and processing</li>
                  <li>Approved refunds will be processed within 10 business days</li>
                </ol>

                <h3 className="font-newsreader text-xl font-semibold mb-3 mt-6">13.5 Dispute Resolution</h3>
                <p className="text-muted-foreground mb-4">
                  If you disagree with our refund decision, you may:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Appeal the decision by contacting our support team</li>
                  <li>Dispute the charge with your payment provider</li>
                  <li>Seek resolution through applicable consumer protection agencies</li>
                </ul>
              </div>

              <div>
                <h2 className="font-newsreader text-2xl font-bold mb-4">14. Contact Information</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-muted-foreground">
                    <strong>News Briefing Support</strong><br />
                    Email: support@newsbriefing.app<br />
                    Website: <a href="https://newsbriefing.app" className="text-primary hover:underline">https://newsbriefing.app</a>
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground text-center">
                By using News Briefing, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
