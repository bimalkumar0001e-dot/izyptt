import React, { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { PackageOpen, Package, MessageCircle, Clock, ArrowLeftRight, Phone, Mail, AlertTriangle, Video, CheckCircle2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface ReturnInstruction {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
}

const API_URL = 'http://localhost:5001/api/admin/return-instructions';

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

  // Helper function to get the appropriate icon for a section
  const getIconForSection = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('return') && lowerTitle.includes('product')) return <ArrowLeftRight className="w-6 h-6 text-blue-500" />;
    if (lowerTitle.includes('record') || lowerTitle.includes('video')) return <Video className="w-6 h-6 text-purple-500" />;
    if (lowerTitle.includes('contact')) return <MessageCircle className="w-6 h-6 text-green-500" />;
    if (lowerTitle.includes('timely') || lowerTitle.includes('time')) return <Clock className="w-6 h-6 text-amber-500" />;
    return <Package className="w-6 h-6 text-indigo-500" />;
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
          <div className="space-y-6 pb-8">
            {instructions.map((instr, index) => (
              <div 
                key={instr._id || index} 
                className="rounded-2xl p-5 bg-white shadow-md border border-gray-100"
                style={{
                  background: index % 2 === 0 
                    ? "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)" 
                    : "linear-gradient(135deg, #ffffff 0%, #fff7f0 100%)"
                }}
              >
                <div className="flex items-start">
                  {getIconForSection(instr.title)}
                  <div className="ml-3 flex-1">
                    <h2 className="font-bold text-xl text-gray-800 mb-3">{instr.title}</h2>
                    <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700 leading-relaxed">
                      {instr.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                    </div>
                    
                    {/* Conditional contact information display with icons */}
                    {instr.content.includes('WhatsApp') && (
                      <div className="mt-3 flex items-center">
                        <Phone className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium">Contact via WhatsApp</span>
                      </div>
                    )}
                    
                    {instr.content.includes('email') && (
                      <div className="mt-2 flex items-center">
                        <Mail className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="font-medium">Contact via Email</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Visual timeline indicator */}
                {index < instructions.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="w-1 h-6 bg-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Final note with checkmark */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-start">
              <CheckCircle2 className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
              <p className="text-green-800 text-sm">
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
