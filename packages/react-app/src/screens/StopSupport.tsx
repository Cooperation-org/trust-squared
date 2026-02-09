import { useState } from "react";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ABI from "../abis/CFAv1Forwarder.json";
import { GOODDOLLAR, SF_FORWARDER, POOL_CONTRACT } from "@/env";
import {
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import {
  ArrowLeft,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { truncateAddress, formatFlow } from "@/utils";
import Blockies from "react-blockies";

const isMiniPay = !!(window?.ethereum && 'isMiniPay' in window.ethereum && (window.ethereum as Record<string, unknown>).isMiniPay);
const gasOpts = isMiniPay
  ? {}
  : {
      maxFeePerGas: BigInt(25.1e9),
      maxPriorityFeePerGas: BigInt(1e8),
    };

const useGetFlowRate = (sender: string | undefined) => {
  const result = useReadContract({
    address: SF_FORWARDER as `0x${string}`,
    abi: [
      {
        name: "getFlowrate",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "token", type: "address" },
          { name: "sender", type: "address" },
          { name: "receiver", type: "address" },
        ],
        outputs: [{ name: "", type: "int96" }],
      },
    ],
    functionName: "getFlowrate",
    args: [
      GOODDOLLAR as `0x${string}`,
      (sender || "0x0000000000000000000000000000000000000000") as `0x${string}`,
      POOL_CONTRACT as `0x${string}`,
    ],
    query: { enabled: !!sender },
  });
  if (!sender || !result.data) return 0n;
  return BigInt(result.data);
};

type Step = "confirm" | "processing" | "done";

export default function StopSupport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const trusteeAddress = searchParams.get("address") || "";
  const flowRateStr = searchParams.get("flowRate") || "0";
  const existingFlowRate = useGetFlowRate(account.address);

  const [step, setStep] = useState<Step>("confirm");

  const monthlyAmount = formatFlow(flowRateStr);

  const handleStopSupport = async () => {
    if (!trusteeAddress || !account.address) return;

    setStep("processing");

    try {
      const trusteeFlowRate = BigInt(flowRateStr);
      const newFlowRate = existingFlowRate - trusteeFlowRate;

      if (newFlowRate <= 0n) {
        // Delete the entire flow if this is the only trustee
        const userData = encodeAbiParameters(
          parseAbiParameters("address,int96"),
          [trusteeAddress as `0x${string}`, 0n]
        );

        await writeContractAsync({
          ...gasOpts,
          abi: ABI,
          functionName: "deleteFlow",
          address: SF_FORWARDER as `0x${string}`,
          args: [GOODDOLLAR, account.address, POOL_CONTRACT, userData],
        });
      } else {
        // Update flow to reduce by trustee's rate
        const userData = encodeAbiParameters(
          parseAbiParameters("address,int96"),
          [trusteeAddress as `0x${string}`, 0n]
        );

        await writeContractAsync({
          ...gasOpts,
          abi: ABI,
          functionName: "updateFlow",
          address: SF_FORWARDER as `0x${string}`,
          args: [
            GOODDOLLAR,
            account.address,
            POOL_CONTRACT,
            newFlowRate,
            userData,
          ],
        });
      }

      setStep("done");
      toast({
        title: "Support stopped",
        description: `You are no longer supporting ${truncateAddress(trusteeAddress)}`,
      });
    } catch (e: unknown) {
      setStep("confirm");
      toast({
        title: "Transaction failed",
        description: "Could not stop support. Please try again.",
      });
    }
  };

  // Processing
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
        <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Stopping Support</h2>
        <p className="text-gray-400 text-sm text-center">
          Please confirm in your wallet and wait...
        </p>
      </div>
    );
  }

  // Done
  if (step === "done") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Support Stopped</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          You are no longer streaming to {truncateAddress(trusteeAddress)}
        </p>
        <button
          onClick={() => navigate("/streams")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Back to Streams
        </button>
      </div>
    );
  }

  // Confirm Step (default)
  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-800 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <h1 className="text-white font-semibold">Stream Details</h1>
        <button onClick={() => navigate("/")} className="p-1 hover:bg-gray-800 rounded-full">
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Stream Visual */}
        <div className="flex items-center justify-center gap-4 py-4">
          {account.address && (
            <div className="text-center">
              <Blockies seed={account.address.toLowerCase()} size={10} scale={5} className="rounded-full mx-auto" />
              <p className="text-white text-sm mt-2">You</p>
            </div>
          )}
          <div className="bg-green-600 rounded-full p-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div className="text-center">
            <Blockies seed={trusteeAddress.toLowerCase()} size={10} scale={5} className="rounded-full mx-auto" />
            <p className="text-white text-sm mt-2">{truncateAddress(trusteeAddress)}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-green-400 text-3xl font-bold">{monthlyAmount}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-gray-400 text-sm">per month</span>
            <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full">ACTIVE</span>
          </div>
        </div>

        {/* Stop Confirmation */}
        <div className="bg-gray-900/80 rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-2">
              Stop Supporting {truncateAddress(trusteeAddress)}?
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Stopping will reduce their Trust Score impact. This action cannot be undone immediately.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleStopSupport}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Yes, Stop Support
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full border border-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs">TRUST² PLATFORM</p>
      </div>
    </div>
  );
}
