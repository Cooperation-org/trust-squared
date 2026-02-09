import TrustAccount from "@/components/TrustAccount";
import { useGetMember } from "@/hooks/queries/useGetMember";

import { useBalanceStream } from "@/hooks/useBalanceStream";
import { formatScore, formatFlow } from "@/utils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { QRCodeSVG } from "qrcode.react";
import { useAccount } from "wagmi";
import { useVerifiedIdentities } from "@/hooks/useVerifiedIdentities";
import { BadgeCheck, ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";

export default function Home() {
  const account = useAccount();
  const { data } = useGetMember(account.address as string);
  const identities = useVerifiedIdentities(account.address);

  const inFlowRate = BigInt(data?.data?.member?.inFlowRate || 0);
  const outFlowRate = BigInt(data?.data?.member?.outFlowRate || 0);
  const netFlowRate = inFlowRate - outFlowRate;

  const balance = useBalanceStream(account.address, netFlowRate);

  const { user = {} } = useDynamicContext();

  const supporters = data?.data?.member?.trustees?.length || 0;
  const trustees = data?.data?.member?.trusters?.length || 0;

  const trustScore = formatScore(data?.data?.member?.trustScore || "");

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* Header with Profile */}
      <div className="flex items-center justify-between mb-6">
        {account.address && (
          <TrustAccount
            address={account.address as string}
            name={(user as { alias?: string; email?: string })?.alias || (user as { email?: string })?.email?.split("@")[0] || ""}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-sm mx-auto space-y-4">
        {/* Balance - Prominent */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Balance</p>
          <p className="text-white text-3xl font-bold mb-3">
            {balance ? `${balance} G$` : "0 G$"}
          </p>

          {/* Inflow / Outflow */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <ArrowDownLeft className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm">
                {inFlowRate > 0n ? formatFlow(inFlowRate.toString()) : "0 G$"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">
                {outFlowRate > 0n ? formatFlow(outFlowRate.toString()) : "0 G$"}
              </span>
            </div>
          </div>
        </div>

        {/* Trust Score - Prominent */}
        <div className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 bg-opacity-20 p-2.5 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Trust Score</p>
              <p className="text-white text-xl font-bold">{trustScore || "0"}</p>
            </div>
          </div>
        </div>

        {/* Supporters and Trustees Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Supporters</p>
            <p className="text-white text-2xl font-bold">{supporters}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Trustees</p>
            <p className="text-white text-2xl font-bold">{trustees}</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center">
          <QRCodeSVG
            bgColor="white"
            fgColor="black"
            className="rounded-lg mb-3"
            value={account.address as string}
            size={140}
            level="H"
            includeMargin={true}
          />
          <p className="text-gray-400 text-sm text-center">
            Scan to receive your funds
          </p>
        </div>

        {/* Verified Identities */}
        {Object.entries(identities || {}).some(([, v]) => v) && (
          <div className="bg-gray-900 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">Verified Identities</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(identities || {}).map(([k, v]) => {
                if (v)
                  return (
                    <div key={k} className="flex items-center gap-2 bg-green-600 bg-opacity-20 px-3 py-1.5 rounded-full">
                      <span className="text-green-400 text-sm capitalize">{k}</span>
                      <BadgeCheck className="h-4 w-4 text-green-400" />
                    </div>
                  );
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom padding for navigation */}
      <div className="pb-24"></div>
    </div>
  );
}
