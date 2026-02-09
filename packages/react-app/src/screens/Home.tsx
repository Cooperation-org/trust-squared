import { useGetMember } from "@/hooks/queries/useGetMember";
import { useBalanceStream } from "@/hooks/useBalanceStream";
import { formatScore, formatFlow, truncateAddress } from "@/utils";
import { useAccount } from "wagmi";
import { useVerifiedIdentities } from "@/hooks/useVerifiedIdentities";
import VerificationBanner from "@/components/VerificationBanner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Heart,
  BarChart3,
  BadgeCheck,
  Users,
  ChevronRight,
  Gift,
} from "lucide-react";
import { Link } from "react-router-dom";
import Blockies from "react-blockies";

export default function Home() {
  const account = useAccount();
  const { data } = useGetMember(account.address as string);
  const identities = useVerifiedIdentities(account.address);

  const inFlowRate = BigInt(data?.data?.member?.inFlowRate || 0);
  const outFlowRate = BigInt(data?.data?.member?.outFlowRate || 0);
  const netFlowRate = inFlowRate - outFlowRate;

  const balance = useBalanceStream(account.address, netFlowRate);

  const supporters = data?.data?.member?.trusters?.length || 0;
  const trustees = data?.data?.member?.trustees?.length || 0;
  const trustScore = formatScore(data?.data?.member?.trustScore || "");
  const displayName = truncateAddress(account.address || "");

  const hasIdentity = Object.entries(identities || {}).some(([, v]) => v);

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {account.address && (
              <Blockies
                seed={account.address.toLowerCase()}
                size={8}
                scale={5}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-white font-semibold text-lg">{displayName}</h1>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-sm">Trust Score</span>
                <span className="text-green-400 text-sm font-medium">{trustScore}</span>
              </div>
            </div>
          </div>
          {hasIdentity && (
            <div className="bg-green-600/20 p-2 rounded-full">
              <BadgeCheck className="h-5 w-5 text-green-400" />
            </div>
          )}
        </div>
      </div>

      {/* Verification Banner - shown when no identity verified */}
      <VerificationBanner />

      <div className="px-5 space-y-4">
        {/* Balance Card */}
        <div className="bg-gray-900/80 rounded-2xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            G$ Balance
          </p>
          <p className="text-white text-3xl font-bold mb-4">
            {balance ? `${balance}` : "0.00"}
            <span className="text-lg text-gray-400 ml-1">G$</span>
          </p>

          {/* Inflow / Outflow */}
          <div className="flex gap-4">
            <div className="flex-1 bg-black/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDownLeft className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400 text-xs font-medium">INCOMING</span>
              </div>
              <p className="text-white font-semibold">
                {inFlowRate > 0n ? formatFlow(inFlowRate.toString()) : "0 G$"}
              </p>
              <p className="text-gray-500 text-xs">
                From {supporters} stream{supporters !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 bg-black/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-medium">OUTGOING</span>
              </div>
              <p className="text-white font-semibold">
                {outFlowRate > 0n ? formatFlow(outFlowRate.toString()) : "0 G$"}
              </p>
              <p className="text-gray-500 text-xs">
                To {trustees} stream{trustees !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Supporters & Trustees Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              <span className="text-gray-400 text-xs">Supporters</span>
            </div>
            <p className="text-white text-2xl font-bold">{supporters}</p>
          </div>
          <div className="bg-gray-900/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
              <span className="text-gray-400 text-xs">Trustees</span>
            </div>
            <p className="text-white text-2xl font-bold">{trustees}</p>
          </div>
        </div>

        {/* Net Flow */}
        <div className="bg-gray-900/80 rounded-xl p-4 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Net Flow</span>
          <span
            className={`font-semibold ${
              netFlowRate > 0n
                ? "text-green-400"
                : netFlowRate < 0n
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {netFlowRate !== 0n
              ? `${netFlowRate > 0n ? "+" : "-"}${formatFlow(
                  (netFlowRate > 0n ? netFlowRate : -netFlowRate).toString()
                )}/mo`
              : "0 G$/mo"}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="space-y-1.5">
          <p className="text-gray-500 text-xs uppercase tracking-wider px-1">
            Quick Actions
          </p>
          <Link
            to="/claim"
            className="flex items-center justify-between bg-gray-900/80 rounded-xl p-4 hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-600/20 p-2.5 rounded-full">
                <Gift className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-white font-medium">Claim Daily G$</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </Link>
          <Link
            to="/trust"
            className="flex items-center justify-between bg-gray-900/80 rounded-xl p-4 hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-600/20 p-2.5 rounded-full">
                <Heart className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-white font-medium">Support Someone</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </Link>
          <Link
            to="/streams"
            className="flex items-center justify-between bg-gray-900/80 rounded-xl p-4 hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2.5 rounded-full">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-white font-medium">View My Support Streams</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </Link>
          <Link
            to="/explore"
            className="flex items-center justify-between bg-gray-900/80 rounded-xl p-4 hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-600/20 p-2.5 rounded-full">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-white font-medium">Explore Community</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </Link>
        </div>

        {/* Verified Identities */}
        {hasIdentity && (
          <div className="bg-gray-900/80 rounded-xl p-4">
            <h3 className="text-white font-medium text-sm mb-3">
              Verified Identities
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(identities || {}).map(([k, v]) => {
                if (!v) return null;
                return (
                  <div
                    key={k}
                    className="flex items-center gap-1.5 bg-green-600/15 px-3 py-1.5 rounded-full"
                  >
                    <BadgeCheck className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-green-400 text-xs capitalize">{k}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
