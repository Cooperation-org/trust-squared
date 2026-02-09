import { useGetMember, useGetMemberTrustees, useGetMemberTrusters } from "@/hooks/queries/useGetMember";
import { useBalanceStream } from "@/hooks/useBalanceStream";
import { formatScore, formatFlow, truncateAddress } from "@/utils";
import { QRCodeSVG } from "qrcode.react";
import { useAccount } from "wagmi";
import { useVerifiedIdentities } from "@/hooks/useVerifiedIdentities";
import { ArrowDownLeft, ArrowUpRight, Share2, Settings, BadgeCheck } from "lucide-react";
import Blockies from "react-blockies";
import { Link } from "react-router-dom";

export default function Profile() {
  const account = useAccount();
  const { data: memberData } = useGetMember(account.address as string);
  const { data: trusteesData } = useGetMemberTrustees(account.address ?? "");
  const { data: trustersData } = useGetMemberTrusters(account.address ?? "");
  const identities = useVerifiedIdentities(account.address);

  const inFlowRate = BigInt(memberData?.data?.member?.inFlowRate || 0);
  const outFlowRate = BigInt(memberData?.data?.member?.outFlowRate || 0);
  const netFlowRate = inFlowRate - outFlowRate;

  const balance = useBalanceStream(account.address, netFlowRate);

  const trustees = trusteesData?.data?.member?.trustees || [];
  const trusters = trustersData?.data?.member?.trusters || [];
  const trustScore = formatScore(memberData?.data?.member?.trustScore || "");
  const displayName = truncateAddress(account.address || "");

  const hasIdentity = Object.entries(identities || {}).some(([, v]) => v);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${displayName} on Trust²`,
        text: `Support me on Trust² — stream G$ to build community trust.`,
        url: window.location.origin + `/?address=${account.address}`,
      });
    } else {
      await navigator.clipboard.writeText(account.address || "");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {account.address && (
            <Blockies
              seed={account.address.toLowerCase()}
              size={8}
              scale={5}
              className="rounded-full"
            />
          )}
          <span className="text-green-400 font-semibold text-lg">{displayName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Share2 className="h-5 w-5 text-gray-400" />
          </button>
          <Link to="/settings" className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <Settings className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* QR Code */}
        <div className="bg-gray-900/80 rounded-2xl p-5 flex flex-col items-center">
          <div className="bg-white rounded-xl p-3">
            <QRCodeSVG
              value={account.address as string}
              size={160}
              level="H"
              bgColor="white"
              fgColor="black"
            />
          </div>
          <p className="text-gray-400 text-sm mt-3">Scan to receive your funds</p>
        </div>

        {/* Incoming / Outgoing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/80 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownLeft className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400 text-xs font-medium">INCOMING</span>
            </div>
            <p className="text-white text-xl font-bold">
              {inFlowRate > 0n ? formatFlow(inFlowRate.toString()) : "0 G$"}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              From {trusters.length} active stream{trusters.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="bg-gray-900/80 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
              <span className="text-red-400 text-xs font-medium">OUTGOING</span>
            </div>
            <p className="text-white text-xl font-bold">
              {outFlowRate > 0n ? formatFlow(outFlowRate.toString()) : "0 G$"}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              To {trustees.length} active stream{trustees.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Balance & Trust Score */}
        <div className="bg-gray-900/80 rounded-xl p-4 flex items-center justify-between">
          <span className="text-white font-medium">Balance</span>
          <span className="text-white font-bold">
            {balance ? `${balance} G$` : "0 G$"}
          </span>
        </div>

        <div className="bg-gray-900/80 rounded-xl p-4 flex items-center justify-between">
          <span className="text-white font-medium">Trust Score</span>
          <span className="text-green-400 font-bold">{trustScore}</span>
        </div>

        {/* Verified Identities */}
        {hasIdentity && (
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
        )}

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Recent Activity</h3>
          </div>

          {trusters.length === 0 && trustees.length === 0 ? (
            <div className="bg-gray-900/80 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">No activity yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Start supporting someone or share your profile to receive support
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {trusters.slice(0, 3).map((t) => {
                const addr = t.id.split("_")[0];
                return (
                  <div key={t.id} className="bg-gray-900/80 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Blockies seed={addr.toLowerCase()} size={6} scale={4} className="rounded-full" />
                      <div>
                        <p className="text-white text-sm font-medium">{truncateAddress(addr)}</p>
                        <p className="text-gray-500 text-xs">Supporting you</p>
                      </div>
                    </div>
                    <span className="text-green-400 text-sm font-medium">
                      +{formatFlow(t.flowRate.toString())}
                    </span>
                  </div>
                );
              })}
              {trustees.slice(0, 3).map((t) => {
                const addr = t.id.split("_")[1];
                return (
                  <div key={t.id} className="bg-gray-900/80 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Blockies seed={addr.toLowerCase()} size={6} scale={4} className="rounded-full" />
                      <div>
                        <p className="text-white text-sm font-medium">{truncateAddress(addr)}</p>
                        <p className="text-gray-500 text-xs">You support</p>
                      </div>
                    </div>
                    <span className="text-red-400 text-sm font-medium">
                      -{formatFlow(t.flowRate.toString())}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
