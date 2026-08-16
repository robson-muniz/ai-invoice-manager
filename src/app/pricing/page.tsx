import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-gray-600 mb-6">Perfect for getting started</p>

            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">Up to 10 invoices/month</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">Up to 5 customers</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">Basic dashboard</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mr-3">✗</span>
                <span className="text-gray-500">AI features</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mr-3">✗</span>
                <span className="text-gray-500">Recurring invoices</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full block text-center border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-blue-600 rounded-lg p-8 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                RECOMMENDED
              </span>
            </div>
            <p className="text-gray-600 mb-6">For growing businesses</p>

            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">$29</span>
              <span className="text-gray-600">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">Unlimited invoices</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">Unlimited customers</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">AI invoice assistant</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">Recurring invoices</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
