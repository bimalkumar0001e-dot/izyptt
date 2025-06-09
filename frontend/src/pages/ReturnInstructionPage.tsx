import React, { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { PackageOpen, Package, MessageCircle, Clock, ArrowLeftRight, Phone, Mail, AlertTriangle, Video, CheckCircle2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { BACKEND_URL } from '@/utils/utils';

interface ReturnInstruction {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
}

const API_URL = `${BACKEND_URL}/api/admin/return-instructions`;

// Fallback instructions in case the API doesn't return any
const fallbackInstructions: Partial<ReturnInstruction>[] = [
  {
    title: "How to Return a Product",
    content: "📦 Return & Exchange Instructions\nIf you wish to return or exchange a product, please follow these simple steps to ensure a smooth and valid process:"
  },
  {
    title: "Record a Delivery Video",
    content: "Please make a clear video at the time of delivery showing the condition of the product package before opening.\n\n🎬 Unboxing Video is Mandatory.\n\nWhile unboxing, record a video without any cuts or edits showing the complete unboxing process.\n\nThis helps us verify any damage or mismatch."
  },
  {
    title: "Contact Us Immediately",
    content: "Once videos are ready, WhatsApp them to:\n📱 6203600742\n\nOr email us at:\n📧 deepak23187@iiiitd.ac.in"
  },
  {
    title: "Timely Requests Only",
    content: "⏰ Replacement is only possible within 1 day of delivery (if the product is eligible).\n\n❌ Returns are not accepted for non-returnable items (clearly mentioned on product page)."
  }
];

// Box styles for each instruction type
const boxStyles = [
  { bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-700", icon: "text-blue-600" },
  { bg: "bg-purple-50", border: "border-purple-200", title: "text-purple-700", icon: "text-purple-600" },
  { bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-700", icon: "text-amber-600" },
  { bg: "bg-green-50", border: "border-green-200", title: "text-green-700", icon: "text-green-600" },
];

const ReturnInstructionPage: React.FC = () => {
  const [instructions, setInstructions] = useState<ReturnInstruction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const activeInstructions = data.filter((instr: ReturnInstruction) => instr.isActive);
        setInstructions(activeInstructions.length > 0 ? activeInstructions : fallbackInstructions as ReturnInstruction[]);
        setLoading(false);
      })
      .catch(() => {
        // Use fallback data on error
        setInstructions(fallbackInstructions as ReturnInstruction[]);
        setLoading(false);
      });
  }, []);

  // Helper function to get the appropriate icon for a section with custom color
  const getIconForSection = (title: string, colorClass: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('return') && lowerTitle.includes('product')) return <ArrowLeftRight className={`w-6 h-6 ${colorClass}`} />;
    if (lowerTitle.includes('record') || lowerTitle.includes('video')) return <Video className={`w-6 h-6 ${colorClass}`} />;
    if (lowerTitle.includes('contact')) return <MessageCircle className={`w-6 h-6 ${colorClass}`} />;
    if (lowerTitle.includes('timely') || lowerTitle.includes('time')) return <Clock className={`w-6 h-6 ${colorClass}`} />;
    return <Package className={`w-6 h-6 ${colorClass}`} />;
  };

  return (
    <div className="app-container bg-gray-50">
      <AppHeader title="Return Instructions" />
      <div className="flex-1 pb-16 px-4">
        {/* Page title section with icon */}
        <div className="flex items-center justify-center my-5">
          <PackageOpen className="w-8 h-8 mr-3 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Return Instructions</h1>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg text-gray-600 font-medium">Loading instructions...</p>
          </div>
        ) : instructions.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-200">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700">No return instructions available</p>
            <p className="text-gray-500 mt-2">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="space-y-8 pb-8">
            {instructions.map((instr, index) => {
              const style = boxStyles[index % boxStyles.length];
              return (
                <div 
                  key={instr._id || index} 
                  className={`rounded-2xl p-5 shadow-lg ${style.bg} border ${style.border} transition-all hover:shadow-xl`}
                >
                  <div className="flex items-start">
                    {getIconForSection(instr.title, style.icon)}
                    <div className="ml-4 flex-1">
                      <h2 className={`font-bold text-xl mb-3 ${style.title}`}>{instr.title}</h2>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700 leading-relaxed">
                        {instr.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>
                      
                      {/* Conditional contact information display with icons */}
                      {instr.content.includes('WhatsApp') && (
                        <div className="mt-4 flex items-center p-2 bg-white bg-opacity-50 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-700">Contact via WhatsApp:-9204520826</span>
                        </div>
                      )}
                      
                      {instr.content.includes('email') && (
                        <div className="mt-2 flex items-center p-2 bg-white bg-opacity-50 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-700">Contact via Email:-izyptcare@gmail.com</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Final note with checkmark */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex items-start shadow-md">
              <CheckCircle2 className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
              <p className="text-green-800 text-sm font-medium">
                Following these instructions carefully will help us process your return or exchange request smoothly. Thank you for your cooperation!
              </p>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ReturnInstructionPage;
