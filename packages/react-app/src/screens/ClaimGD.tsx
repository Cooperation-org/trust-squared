import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useBalance,
} from "wagmi";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GOODDOLLAR } from "@/env";
import {
  ArrowLeft,
  Gift,
  Clock,
  Loader2,
  CheckCircle2,
  Coins,
  Info,
  ExternalLink,
} from "lucide-react";
import { formatUnits } from "viem";

// GoodDollar UBI contract on Celo
const UBI_CONTRACT = "0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1" as const;

const UBI_ABI = [
  {
    name: "checkEntitlement",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// ERC20 balance ABI
const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const isMiniPay = !!(
  window?.ethereum &&
  "isMiniPay" in window.ethereum &&
  (window.ethereum as Record<string, unknown>).isMiniPay
);
const gasOpts = isMiniPay
  ? {}
  : {
      maxFeePerGas: BigInt(25.1e9),
      maxPriorityFeePerGas: BigInt(1e8),
    };

type ClaimStep = "idle" | "claiming" | "success" | "error";

export default function ClaimGD() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const [step, setStep] = useState<ClaimStep>("idle");

  // Check how much user can claim
  const {
    data: entitlement,
    isLoading: entitlementLoading,
    refetch: refetchEntitlement,
  } = useReadContract({
    address: UBI_CONTRACT,
    abi: UBI_ABI,
    functionName: "checkEntitlement",
    query: { enabled: !!address },
  });

  // Get G$ token balance
  const {
    data: gdBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: GOODDOLLAR as `0x${string}`,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const claimableAmount = entitlement ? BigInt(entitlement) : 0n;
  const canClaim = claimableAmount > 0n;
  const formattedClaimable = claimableAmount > 0n
    ? Number(formatUnits(claimableAmount, 18)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  const formattedBalance = gdBalance
    ? Number(formatUnits(BigInt(gdBalance as bigint), 18)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  const handleClaim = async () => {
    if (!address || !canClaim) return;

    setStep("claiming");

    try {
      await writeContractAsync({
        ...gasOpts,
        address: UBI_CONTRACT,
        abi: UBI_ABI,
        functionName: "claim",
      });

      setStep("success");
      toast({
        title: "G$ Claimed!",
        description: `You successfully claimed ${formattedClaimable} G$`,
      });

      // Refetch balances
      refetchEntitlement();
      refetchBalance();
    } catch (e: unknown) {
      setStep("error");
      toast({
        title: "Claim failed",
        description: "Could not claim G$. Please try again.",
      });
      // Reset to idle after a moment so they can retry
      setTimeout(() => setStep("idle"), 2000);
    }
  };

  // Claiming state
  if (step === "claiming") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
        <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Claiming G$</h2>
        <p className="text-gray-400 text-sm text-center">
          Please confirm in your wallet and wait...
        </p>
      </div>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">G$ Claimed!</h2>
        <p className="text-gray-400 text-sm text-center mb-2">
          You successfully claimed your daily G$ UBI
        </p>
        <p className="text-green-400 text-2xl font-bold mb-6">
          +{formattedClaimable} G$
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep("idle");
              refetchEntitlement();
              refetchBalance();
            }}
            className="border border-gray-700 text-white px-5 py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            Check Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Main screen
  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <h1 className="text-white font-semibold text-lg">Claim G$</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Balance Card */}
        <div className="bg-gray-900/80 rounded-2xl p-5 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-600/20 flex items-center justify-center">
            <Coins className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            Your G$ Balance
          </p>
          <p className="text-white text-3xl font-bold">
            {formattedBalance}
            <span className="text-lg text-gray-400 ml-1">G$</span>
          </p>
        </div>

        {/* Claim Card */}
        <div className="bg-gray-900/80 rounded-2xl p-5">
          {entitlementLoading ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-3" />
              <p className="text-gray-400 text-sm">Checking claim status...</p>
            </div>
          ) : canClaim ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Gift className="h-5 w-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  UBI Available!
                </span>
              </div>
              <div>
                <p className="text-white text-4xl font-bold">
                  {formattedClaimable}
                </p>
                <p className="text-gray-400 text-sm mt-1">G$ ready to claim</p>
              </div>
              <button
                onClick={handleClaim}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Claim G$
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">
                  Already Claimed
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                You've already claimed your G$ for today. Come back tomorrow for
                your next claim.
              </p>
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                  Next Claim
                </p>
                <p className="text-white font-semibold">Tomorrow</p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="mt-4 bg-red-600/15 border border-red-600/30 rounded-xl p-3 text-center">
              <p className="text-red-400 text-sm">
                Claim failed. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* What is G$ UBI */}
        <div className="bg-gray-900/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-green-400" />
            <h3 className="text-white font-medium text-sm">
              What is G$ UBI?
            </h3>
          </div>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>
              GoodDollar distributes free digital currency (G$) daily to
              verified members as Universal Basic Income.
            </p>
            <p>
              Claim your daily G$ and use it to support others in the community
              through Trust² streams.
            </p>
          </div>
        </div>

        {/* How to use */}
        <div className="bg-gray-900/80 rounded-xl p-4">
          <h3 className="text-white font-medium text-sm mb-3">
            How to use your G$
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Claim daily</p>
                <p className="text-gray-500 text-xs">
                  Come back every day to claim your G$ UBI
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  Support others
                </p>
                <p className="text-gray-500 text-xs">
                  Stream G$ to people you trust in your community
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  Build trust
                </p>
                <p className="text-gray-500 text-xs">
                  Earn Trust Score as others support you back
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Learn More */}
        <a
          href="https://www.gooddollar.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-green-400 text-sm py-3 hover:text-green-300 transition-colors"
        >
          Learn more about GoodDollar
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
