import { Link } from "react-router-dom";

const RegistrationPending = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-app-primary mb-4">Phone Verified!</h1>
      <p className="text-lg text-gray-700 mb-4">
        Registration request sent for admin approval.<br />
        You'll be notified once approved.
      </p>
      <Link to="/" className="text-app-primary font-medium underline">
        Return to Home
      </Link>
    </div>
  </div>
);

export default RegistrationPending;
