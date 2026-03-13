import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Real Estate Investor Tools</h1>
            <p className="py-6">
              Analyze deals, calculate ROI, and track your property portfolio all in one place.
            </p>
            <div className="space-x-4">
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Deal Analyzer</h3>
                  <p className="text-sm">Calculate ROI, cash flow, and cap rate instantly</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Portfolio Tracking</h3>
                  <p className="text-sm">Save and compare multiple properties</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Rental & Flip Analysis</h3>
                  <p className="text-sm">Tools for both buy-and-hold and fix-and-flip strategies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
