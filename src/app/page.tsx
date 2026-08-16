import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">
            AI Invoice Manager
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professional Invoicing Made Simple
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create and send professional invoices in minutes. Track payments,
              manage customers, and get paid faster with AI-powered insights.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="border border-gray-300 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Professional Invoices
              </h3>
              <p className="text-gray-600">
                Create beautiful, branded invoices in seconds
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Assistance
              </h3>
              <p className="text-gray-600">
                Let AI help you describe services and suggest items
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Paid Faster
              </h3>
              <p className="text-gray-600">
                Accept payments and track payment status effortlessly
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            © 2024 AI Invoice Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
