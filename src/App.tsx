import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <header className="px-4 py-3 lg:px-6 lg:py-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/Pograma_Header_Logo.png"
                alt="POGrama"
                className="h-8 w-auto object-contain lg:h-10"
              />
            </div>
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#solutions" className="text-gray-300 hover:text-white transition">Solutions</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
              <Link to="/designer" className="text-gray-300 hover:text-white transition">Log in</Link>
              <Link
                to="/designer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-4 py-16 md:py-20 lg:py-24">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/background_pograma.png)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-[#0B1120]/80 to-[#0B1120]" />
          
          <div className="relative z-10 container mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Optimize Your <span className="text-blue-500">Retail Space</span><br />
                with <span className="text-blue-500">Smart Planograms</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Transform your retail space management with POGrama's AI-powered planogram designer. 
                Create efficient layouts, boost sales, and deliver better shopping experiences.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/designer"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  Try POGrama Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                  Watch Demo
                </button>
              </div>
              <p className="mt-6 text-gray-400">
                Shelves that Sell!
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-20 lg:py-24 bg-[#0D1424]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Powerful Features for Retail Excellence
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our comprehensive suite of tools helps you optimize your retail space, boost sales, and
                maintain brand consistency.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-[#0F1729] p-6 rounded-xl">
                  <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-20 bg-[#0B1120]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Retail Space?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of retailers who use POGrama to optimize their stores, boost
              sales, and improve customer experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/designer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                Contact Sales
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              No credit card required • 14 day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

const features = [
  {
    icon: <ArrowRight className="h-6 w-6 text-blue-500" />,
    title: "AI-Powered Optimization",
    description: "Let our AI analyze your space and suggest optimal product placements based on sales data and customer behavior."
  },
  {
    icon: <ArrowRight className="h-6 w-6 text-blue-500" />,
    title: "3D Visualization",
    description: "View your planograms in stunning 3D to better understand product placement and customer perspective."
  },
  {
    icon: <ArrowRight className="h-6 w-6 text-blue-500" />,
    title: "Sales Analytics",
    description: "Track performance metrics, analyze sales data, and make data-driven decisions for your retail space."
  },
  {
    icon: <ArrowRight className="h-6 w-6 text-blue-500" />,
    title: "Compliance Management",
    description: "Ensure all stores follow brand guidelines and maintain consistent product placement standards."
  }
];

export default App;