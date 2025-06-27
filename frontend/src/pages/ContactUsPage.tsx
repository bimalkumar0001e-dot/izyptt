import React from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Mail, Phone, UserMinus, Info, ShieldCheck } from "lucide-react";

const ContactUsPage: React.FC = () => {
  return (
    <div className="app-container bg-gray-50 min-h-screen flex flex-col">
      <AppHeader title="Contact Us & Account Deletion" />
      <div className="flex-1 pb-16 px-4">
        <div className="flex items-center justify-center my-6">
          <Info className="w-8 h-8 mr-3 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Contact Us</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-blue-100">
          <h2 className="flex items-center text-lg font-semibold text-blue-700 mb-2">
            <UserMinus className="w-5 h-5 mr-2 text-blue-500" />
            Request Account & Data Deletion
          </h2>
          <p className="text-gray-700 mb-2">
            If you wish to delete your account and all associated data, please contact us using one of the methods below. We will process your request as soon as possible.
          </p>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-2">
            <li>Include your registered phone number or email for verification.</li>
            <li>Your account and all personal data will be permanently deleted within 7 days of your request.</li>
            <li>Some transactional data (e.g., order history required for legal/tax reasons) may be retained as per regulations.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-green-100">
          <h2 className="flex items-center text-lg font-semibold text-green-700 mb-2">
            <Mail className="w-5 h-5 mr-2 text-green-600" />
            Email
          </h2>
          <p className="text-gray-700 mb-1">
            <span className="font-medium">izyptcare@gmail.com</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-green-100">
          <h2 className="flex items-center text-lg font-semibold text-green-700 mb-2">
            <Phone className="w-5 h-5 mr-2 text-green-600" />
            WhatsApp
          </h2>
          <p className="text-gray-700 mb-1">
            <span className="font-medium">+91 9204520826</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-start shadow-sm">
          <ShieldCheck className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
          <p className="text-gray-700 text-sm">
            <span className="font-semibold">Privacy & Security:</span> We take your privacy seriously. For more details, please refer to our Privacy Policy.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ContactUsPage;
