import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Download, QrCode, Monitor, 
  ChevronRight, Lock, ExternalLink,
  Smartphone, MousePointer2
} from 'lucide-react';

const WhatsAppLogin = () => {
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [stayLoggedIn, setStayLoggedIn] = React.useState(true);

  const handleLoginDemo = (method = 'QR') => {
    setIsAuthenticating(true);
    // Simulate a brief loading state for realism
    setTimeout(() => {
      navigate('/whatsapp');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#f9f9f2] flex flex-col items-center p-6 md:p-12 font-sans selection:bg-[#25d366]/30 relative">
      {/* Loading Overlay */}
      {isAuthenticating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-20 h-20 border-4 border-slate-100 border-t-[#25d366] rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-[#41525d]">Connecting to WhatsApp...</h2>
          <p className="text-slate-500 mt-2">Linking your account securely</p>
        </div>
      )}

      {/* Header Logo */}
      <div className="w-full max-w-[1000px] flex justify-start mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="#25d366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.123.554 4.197 1.607 6.037L0 24l6.105-1.602a11.834 11.834 0 005.937 1.632h.005c6.637 0 12.032-5.395 12.035-12.032a11.762 11.762 0 00-3.417-8.481z" />
          </svg>
          <span className="text-[#25d366] font-bold text-xl tracking-tight">WhatsApp</span>
        </div>
      </div>

      <div className="w-full max-w-[1000px] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Top Banner - Download Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-[#25d366]/5 transition-colors">
              <Monitor className="w-8 h-8 text-slate-400 group-hover:text-[#25d366] transition-colors" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[17px] font-semibold text-[#41525d]">Download WhatsApp for Windows</h3>
              <p className="text-[14px] text-[#667781] max-w-[450px]">
                Get extra features like voice and video calling, screen sharing and more.
              </p>
            </div>
          </div>
          <button className="bg-[#25d366] hover:bg-[#1fa855] text-white px-8 py-2.5 rounded-full text-[14px] font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#25d366]/20">
            Download <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Left Column - Steps */}
            <div className="flex-1 p-8 md:p-12 md:pr-0">
              <h1 className="text-3xl font-light text-[#41525d] mb-12">Scan to log in</h1>
              
              <div className="space-y-10 relative">
                {/* Connecting Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-slate-100"></div>

                {[
                  { id: 1, text: "Scan the QR code with your phone's camera" },
                  { id: 2, text: "Tap the link to open WhatsApp", icon: true },
                  { id: 3, text: "Scan the QR code again to link to your account" }
                ].map((step) => (
                  <div 
                    key={step.id} 
                    className={`flex items-start gap-6 relative z-10 ${step.id === 2 ? 'cursor-pointer hover:bg-[#25d366]/5 p-3 rounded-2xl -ml-3 -my-3 transition-all active:scale-[0.98]' : ''}`}
                    onClick={step.id === 2 ? handleLoginDemo : undefined}
                  >
                    <div className={`w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-[14px] text-[#41525d] shrink-0 font-medium ${step.id === 2 ? 'group-hover:border-[#25d366] group-hover:text-[#25d366]' : ''}`}>
                      {step.id}
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <p className={`text-[17px] leading-tight font-normal ${step.id === 2 ? 'text-[#00a884] font-medium' : 'text-[#41525d]'}`}>
                        {step.text}
                      </p>
                      {step.icon && (
                        <div className="bg-[#25d366] rounded-md p-0.5 shadow-sm">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.123.554 4.197 1.607 6.037L0 24l6.105-1.602a11.834 11.834 0 005.937 1.632h.005c6.637 0 12.032-5.395 12.035-12.032a11.762 11.762 0 00-3.417-8.481z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 ml-14">
                <button className="text-[#00a884] text-[15px] font-medium flex items-center gap-1 hover:underline group">
                  Need help? <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column - QR Code */}
            <div className="md:w-[400px] flex items-center justify-center p-8 md:p-12">
              <div 
                className="relative p-4 bg-white rounded-xl shadow-inner border border-slate-100 cursor-pointer group active:scale-[0.98] transition-all"
                onClick={handleLoginDemo}
              >
                <QrCode className="w-64 h-64 text-[#41525d] stroke-[0.5px]" />
                {/* Center Logo Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white p-2 rounded-full shadow-md">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="#25d366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.123.554 4.197 1.607 6.037L0 24l6.105-1.602a11.834 11.834 0 005.937 1.632h.005c6.637 0 12.032-5.395 12.035-12.032a11.762 11.762 0 00-3.417-8.481z" />
                    </svg>
                  </div>
                </div>
                {/* Instruction Hover */}
                <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
                  <MousePointer2 className="w-8 h-8 text-[#25d366] mb-2 animate-bounce" />
                  <p className="text-[#41525d] font-bold text-sm">Click QR code to login instantly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of Card */}
          <div className="px-8 py-6 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group mb-4 md:mb-0">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                />
                <div className="w-5 h-5 border-2 border-[#25d366] rounded flex items-center justify-center peer-checked:bg-[#25d366] transition-all">
                  <svg className="w-3.5 h-3.5 text-white fill-current opacity-0 peer-checked:opacity-100" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                </div>
              </div>
              <span className="text-[15px] text-[#41525d] font-normal group-hover:text-black transition-colors">Stay logged in on this browser</span>
            </label>
            <button 
              onClick={() => handleLoginDemo('PHONE')}
              className="text-[#00a884] text-[15px] font-medium flex items-center gap-1 hover:underline hover:opacity-80 transition-opacity active:scale-[0.98]"
            >
              Log in with phone number <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Login / Fake Users */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <h2 className="text-[17px] font-semibold text-[#41525d]">Quick Login (Demo Accounts)</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Rohit Gupta', img: 'https://i.pravatar.cc/150?u=RohitGupta' },
              { name: 'Aryan Gupta', img: 'https://i.pravatar.cc/150?u=AryanGupta' },
              { name: 'Isha Patel', img: 'https://i.pravatar.cc/150?u=IshaPatel' },
              { name: 'Siddharth Sharma', img: 'https://i.pravatar.cc/150?u=SiddharthSharma' },
              { name: 'Ananya Iyer', img: 'https://i.pravatar.cc/150?u=AnanyaIyer' },
              { name: 'Vikram Malhotra', img: 'https://i.pravatar.cc/150?u=VikramMalhotra' },
              { name: 'Kavya Reddy', img: 'https://i.pravatar.cc/150?u=KavyaReddy' },
              { name: 'Rohan Verma', img: 'https://i.pravatar.cc/150?u=RohanVerma' }
            ].map((user, idx) => (
              <div 
                key={idx} 
                onClick={handleLoginDemo}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="relative">
                  <img 
                    src={user.img} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-transparent group-hover:border-[#25d366] transition-all shadow-sm group-hover:shadow-md" 
                    alt={user.name} 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                    <Monitor className="w-3 h-3 text-[#25d366]" />
                  </div>
                </div>
                <span className="text-[13px] text-[#41525d] font-medium group-hover:text-[#25d366] transition-colors">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Page Footer */}
        <div className="flex flex-col items-center gap-6 py-10">
          <p className="text-[15px] text-[#41525d]">
            Don't have a WhatsApp account? <Link to="/register" className="text-[#00a884] font-medium hover:underline">Get started <ChevronRight className="w-3.5 h-3.5 inline rotate-[-45deg]" /></Link>
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-[#667781] text-[13px]">
              <Lock className="w-3.5 h-3.5" />
              Your personal messages are end-to-end encrypted
            </div>
            <div className="text-[12px] text-[#667781] hover:underline cursor-pointer">
              Terms & Privacy Policy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLogin;
