import { useState } from "react";
import { useGetMemberTrustees, useGetMemberTrusters } from "@/hooks/queries/useGetMember";
import { formatFlow, truncateAddress } from "@/utils";
import { ArrowLeft, X, Eye, ChevronRight } from "lucide-react";
import Blockies from "react-blockies";
import { useAccount } from "wagmi";
import { useNavigate, Link } from "react-router-dom";

type Tab = "give" | "receive";

export default function SupportStreams() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("give");

  const { data: trusteesData } = useGetMemberTrustees(address ?? "");
  const { data: trustersData } = useGetMemberTrusters(address ?? "");

  const trustees = trusteesData?.data?.member?.trustees || [];
  const trusters = trustersData?.data?.member?.trusters || [];

  const listData = activeTab === "give" ? trustees : trusters;
  const totalCount = listData.length;
  const totalFlow = listData.reduce((acc, curr) => acc + Number(curr.flowRate), 0);

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-800 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h1 className="text-white font-semibold text-lg">Support Streams</h1>
        </div>
        <button onClick={() => navigate("/")} className="p-1 hover:bg-gray-800 rounded-full">
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="px-5 space-y-4">
        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-full p-1">
          <button
            onClick={() => setActiveTab("give")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === "give"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Support I Give
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === "receive"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Support I Receive
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/80 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              {activeTab === "give" ? "TOTAL TRUSTEES" : "TOTAL SUPPORTERS"}
            </p>
            <p className="text-white text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="bg-gray-900/80 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              {activeTab === "give" ? "TOTAL OUTGOING" : "TOTAL INCOMING"}
            </p>
            <p className={`text-2xl font-bold ${activeTab === "give" ? "text-red-400" : "text-green-400"}`}>
              {totalFlow ? formatFlow(totalFlow.toString()) : "0 G$"}
            </p>
          </div>
        </div>

        {/* Active Streams Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">
            Active {activeTab === "give" ? "Outgoing" : "Incoming"} Streams
          </h3>
          {listData.length > 0 && (
            <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
              LIVE
            </span>
          )}
        </div>

        {/* Stream List */}
        {listData.length === 0 ? (
          <div className="bg-gray-900/80 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">
              {activeTab === "give"
                ? "You're not supporting anyone yet"
                : "No one is supporting you yet"}
            </p>
            {activeTab === "give" && (
              <Link
                to="/trust"
                className="inline-block mt-3 text-green-400 text-sm font-medium hover:underline"
              >
                Start supporting someone
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {listData.map((item) => {
              const addr =
                activeTab === "give"
                  ? item.id.split("_")[1]
                  : item.id.split("_")[0];
              const monthlyFlow = formatFlow(item.flowRate.toString());

              return (
                <div
                  key={item.id}
                  className="bg-gray-900/80 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Blockies
                        seed={addr.toLowerCase()}
                        size={8}
                        scale={5}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">{truncateAddress(addr)}</p>
                        <p className={`text-sm ${activeTab === "give" ? "text-red-400" : "text-green-400"}`}>
                          {monthlyFlow} / month
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/stream-details?trustId=${item.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Link>
                    {activeTab === "give" && (
                      <Link
                        to={`/stop-support?trustId=${item.id}&address=${addr}&flowRate=${item.flowRate}`}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm py-2 rounded-lg transition-colors"
                      >
                        Stop Support
                      </Link>
                    )}
                    {activeTab === "receive" && (
                      <Link
                        to={`/stream-details?trustId=${item.id}`}
                        className="flex items-center gap-1 text-green-400 text-sm hover:underline"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
