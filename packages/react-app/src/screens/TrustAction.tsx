import { useState } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import ABI from "../abis/CFAv1Forwarder.json";
import { GOODDOLLAR, SF_FORWARDER, POOL_CONTRACT } from "@/env";
import {
  parseEther,
  encodeAbiParameters,
  parseAbiParameters,
  isAddress,
} from "viem";
import {
  Loader2,
  ArrowLeft,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PasteInput } from "@/components/PasteInput";
import { truncateAddress } from "@/utils";
import Blockies from "react-blockies";

// @ts-expect-error MiniPay detection
const isMiniPay = window?.ethereum?.isMiniPay;
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

type Step = "scan" | "amount" | "confirming" | "success";

export const QrScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const account = useAccount();
  const existingFlowRate = useGetFlowRate(account.address);
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const initialAddress = searchParams.get("address") || undefined;
  const [recipient, setRecipient] = useState<string | undefined>(initialAddress);
  const [amount, setAmount] = useState<string>("");
  const [step, setStep] = useState<Step>(initialAddress && isAddress(initialAddress) ? "amount" : "scan");
  const [txHash, setTxHash] = useState<string>("");

  const numAmount = parseFloat(amount) || 0;

  const handleScan = (results: IDetectedBarcode[]) => {
    if (results.length > 0) {
      const scanned = results[0].rawValue;
      setRecipient(scanned);
      if (isAddress(scanned)) {
        setStep("amount");
      }
    }
  };

  const handleRecipientSubmit = (text: string) => {
    setRecipient(text);
    if (isAddress(text)) {
      setStep("amount");
    }
  };

  const trust = async () => {
    if (!recipient || numAmount <= 0) return;

    setStep("confirming");

    try {
      const monthlyTrustRate = parseEther(amount) / BigInt(60 * 60 * 24 * 30);
      const newFlowRate = existingFlowRate + monthlyTrustRate;

      const userData = encodeAbiParameters(
        parseAbiParameters("address,int96"),
        [recipient as `0x${string}`, monthlyTrustRate]
      );

      const hash = await writeContractAsync({
        ...gasOpts,
        abi: ABI,
        functionName: existingFlowRate === 0n ? "createFlow" : "updateFlow",
        address: SF_FORWARDER as `0x${string}`,
        args: [GOODDOLLAR, account.address, POOL_CONTRACT, newFlowRate, userData],
      });

      setTxHash(hash);
      setStep("success");
      toast({
        title: "Support started!",
        description: "Your stream is now active",
      });
    } catch (e: unknown) {
      setStep("amount");
      toast({
        title: "Transaction failed",
        description: "Please try again",
      });
    }
  };

  // Scan Step
  if (step === "scan") {
    return (
      <div className="min-h-screen bg-black text-white pb-28">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-800 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h1 className="text-white font-semibold text-lg">Support Someone</h1>
        </div>

        <div className="px-5 space-y-4">
          <div className="bg-gray-900/80 rounded-2xl overflow-hidden">
            <Scanner onScan={handleScan} />
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              Or enter a wallet address manually
            </p>
            <PasteInput onChange={handleRecipientSubmit} />
          </div>
        </div>
      </div>
    );
  }

  // Amount Step
  if (step === "amount") {
    return (
      <div className="min-h-screen bg-black text-white pb-28">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => setStep("scan")} className="p-1 hover:bg-gray-800 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h1 className="text-white font-semibold text-lg">Start Supporting</h1>
        </div>

        <div className="px-5 space-y-6">
          {/* Recipient */}
          <div className="flex flex-col items-center space-y-3">
            {recipient && (
              <Blockies
                seed={recipient.toLowerCase()}
                size={12}
                scale={6}
                className="rounded-full"
              />
            )}
            <div className="text-center">
              <p className="text-white font-semibold text-lg">
                {truncateAddress(recipient || "")}
              </p>
              <p className="text-gray-400 text-sm">Receiver on Trust²</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="bg-gray-900/80 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-white font-medium mb-1">Amount per month</p>
              <p className="text-gray-500 text-sm">Set the monthly stream value</p>
            </div>

            <div className="flex items-center bg-black/40 rounded-xl border border-gray-700 focus-within:border-green-600 transition-colors">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent px-4 py-3 text-white text-2xl font-bold outline-none placeholder:text-gray-600"
                min="0"
                step="0.01"
              />
              <span className="pr-4 text-gray-400 font-medium">G$</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="h-4 w-4 text-green-400" />
                <span>
                  Duration: <strong className="text-white">Continuous until stopped</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Safe & Secure Transaction</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-gray-600 text-xs text-center leading-relaxed px-4">
            By starting this stream, you agree to monthly recurring charges. You
            can cancel or edit this support stream at any time from your Trust²
            dashboard.
          </p>

          {/* Submit Button */}
          <Button
            onClick={trust}
            disabled={numAmount <= 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-4 rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Start Streaming Support
          </Button>

          <p className="text-gray-600 text-xs text-center flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" /> SECURED BY TRUST²
          </p>
        </div>
      </div>
    );
  }

  // Confirming Step
  if (step === "confirming") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto" />
          <h2 className="text-white text-xl font-semibold">Processing Transaction</h2>
          <p className="text-gray-400 text-sm">
            Please confirm in your wallet and wait for the transaction to complete...
          </p>
        </div>
      </div>
    );
  }

  // Success Step
  return (
    <div className="min-h-screen bg-black text-white pb-28">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-800 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <h1 className="text-white font-semibold">Confirmation</h1>
        <button onClick={() => navigate("/")} className="text-gray-400 text-sm">
          Done
        </button>
      </div>

      <div className="px-5 space-y-6 flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>

        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-2">
            Support Started Successfully
          </h2>
          <p className="text-gray-400 text-sm">
            You are now streaming <strong className="text-white">{amount} G$/month</strong>
            <br />
            to {truncateAddress(recipient || "")}
          </p>
        </div>

        {/* Transaction Details */}
        <div className="w-full bg-gray-900/80 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Recipient</span>
            <div className="flex items-center gap-2">
              {recipient && (
                <Blockies seed={recipient.toLowerCase()} size={4} scale={4} className="rounded-full" />
              )}
              <span className="text-white text-sm">{truncateAddress(recipient || "")}</span>
            </div>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Amount</span>
            <span className="text-white text-sm">{amount} G$</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Frequency</span>
            <span className="text-white text-sm">Monthly</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          {txHash && (
            <a
              href={`https://celoscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              View Transaction Details
            </a>
          )}
          <button
            onClick={() => navigate("/streams")}
            className="w-full text-center border border-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            View My Streams
          </button>
        </div>
      </div>
    </div>
  );
};
