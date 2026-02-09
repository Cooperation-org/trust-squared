import { ArrowLeft, X, TrendingUp } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatFlow, truncateAddress } from "@/utils";
import Blockies from "react-blockies";

export default function StreamDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const account = useAccount();

  const trustId = searchParams.get("trustId") || "";
  const parts = trustId.split("_");
  const supporter = parts[0] || "";
  const receiver = parts[1] || "";

  // Determine if current user is the supporter
  const isSupporter =
    account.address?.toLowerCase() === supporter.toLowerCase();
  const otherAddress = isSupporter ? receiver : supporter;

  // We'll get flow rate from the query params or from the trust ID context
  const flowRateParam = searchParams.get("flowRate");

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <h1 className="text-white font-semibold">Stream Details</h1>
        <button
          onClick={() => navigate("/")}
          className="p-1 hover:bg-gray-800 rounded-full"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Stream Visual */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="text-center">
            <Blockies
              seed={supporter.toLowerCase()}
              size={10}
              scale={5}
              className="rounded-full mx-auto"
            />
            <p className="text-white text-sm mt-2">
              {isSupporter ? "You" : truncateAddress(supporter)}
            </p>
          </div>
          <div className="bg-green-600 rounded-full p-2">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div className="text-center">
            <Blockies
              seed={receiver.toLowerCase()}
              size={10}
              scale={5}
              className="rounded-full mx-auto"
            />
            <p className="text-white text-sm mt-2">
              {!isSupporter ? "You" : truncateAddress(receiver)}
            </p>
          </div>
        </div>

        {/* Amount & Status */}
        <div className="text-center">
          {flowRateParam ? (
            <p className="text-white text-3xl font-bold">
              {formatFlow(flowRateParam)}
            </p>
          ) : (
            <p className="text-white text-3xl font-bold">Active Stream</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-gray-400 text-sm">per month</span>
            <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Trust Impact */}
        <div className="bg-gray-900/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600/20 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Trust Impact</p>
              <p className="text-gray-500 text-xs">
                Contribution to network health
              </p>
            </div>
          </div>
          <span className="text-green-400 font-medium">+Score</span>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-900/80 rounded-2xl p-4">
          <h3 className="text-white font-medium mb-3">Transaction Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Supporter</span>
              <span className="text-white text-sm">
                {isSupporter ? "You" : truncateAddress(supporter)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Receiver</span>
              <span className="text-white text-sm">
                {!isSupporter ? "You" : truncateAddress(receiver)}
              </span>
            </div>
            {flowRateParam && (
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400 text-sm">Network Rate</span>
                <span className="text-white text-sm">
                  {formatFlow(flowRateParam)}/month
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stop Support Button (only shown for supporter) */}
        {isSupporter && flowRateParam && (
          <Link
            to={`/stop-support?address=${receiver}&flowRate=${flowRateParam}`}
            className="block w-full text-center border border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 rounded-xl font-medium transition-colors"
          >
            Stop Support Stream
          </Link>
        )}
      </div>
    </div>
  );
}
