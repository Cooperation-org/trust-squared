import { useState } from "react";
import { Button } from "@/components/ui/button";
import { injected } from "@wagmi/connectors";
import { useConnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Welcome from "./Welcome";

export default function Login() {
  const { connect } = useConnect();
  const { open } = useAppKit();
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("trust2_onboarded");
  });

  const isMiniPay = !!(
    window?.ethereum && "isMiniPay" in window.ethereum && window.ethereum.isMiniPay
  );

  const onConnectMiniPay = () => {
    try {
      connect({ connector: injected() });
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("trust2_onboarded", "true");
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <Welcome onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-10">
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <img src="/logo2.svg" alt="Trust²" className="w-28 block mx-auto" />
          <div className="space-y-2">
            <p className="text-gray-300 text-sm leading-relaxed">
              Secure. Decentralized. Trusted.
            </p>
            <p className="text-gray-500 text-xs">
              Build your reputation through trust and contributions.
            </p>
          </div>
        </div>

        {/* Connect Wallet */}
        <div className="space-y-4">
          {isMiniPay ? (
            <Button
              onClick={onConnectMiniPay}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-medium text-base transition-all"
            >
              Connect with MiniPay
            </Button>
          ) : (
            <Button
              onClick={() => open()}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-medium text-base transition-all"
            >
              Connect Wallet
            </Button>
          )}

          <p className="text-center text-gray-600 text-xs">
            By connecting your wallet, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
