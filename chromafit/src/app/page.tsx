export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ChromaFit
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create your 3D avatar, try on virtual garments, and discover your perfect fit with AI-powered style analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">3D Avatar</h3>
            <p className="text-gray-600">
              Upload a photo to create your personalized 3D avatar with accurate body measurements.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Virtual Try-On</h3>
            <p className="text-gray-600">
              Try on garments from your wardrobe or online stores with realistic 3D visualization.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Fit Analysis</h3>
            <p className="text-gray-600">
              Get AI-powered fit scores and style recommendations based on your body type and preferences.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <a href="/auth/signup" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </a>
            <a href="/auth/login" className="inline-block border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}