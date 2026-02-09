import TrustAccount from "@/components/TrustAccount";
import { useGetMemberTrustees, useGetMemberTrusters } from "@/hooks/queries/useGetMember";
import { formatFlow, truncateAddress } from "@/utils";
import Blockies from "react-blockies";
import { useAccount } from "wagmi";
import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Trustees() {
  const { address } = useAccount();
  const { user = {} } = useDynamicContext();
  const [activeTab, setActiveTab] = useState<'trustees' | 'trusters'>('trustees');

  const { data: trusteesData } = useGetMemberTrustees(address ?? "");
  const { data: trustersData } = useGetMemberTrusters(address ?? "");

  const listData = activeTab === 'trustees'
    ? trusteesData?.data?.member?.trustees
    : trustersData?.data?.member?.trusters;

  const totalCount = listData?.length || 0;
  const totalFlow = listData?.reduce((acc, curr) => acc + Number(curr.flowRate), 0) || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <TrustAccount
          address={address || ""}
          name={(user as { alias?: string; email?: string })?.alias || (user as { email?: string })?.email?.split("@")[0] || ""}
        />
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mb-6">
        <div className="flex bg-gray-800 rounded-full p-1">
          <button
            onClick={() => setActiveTab('trustees')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'trustees'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trustees
          </button>
          <button
            onClick={() => setActiveTab('trusters')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'trusters'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trusters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 space-y-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4 flex justify-between items-center">
          <span className="text-white font-medium">
            {activeTab === 'trustees' ? 'Total Supporters' : 'Total Trusters'}
          </span>
          <span className="text-white text-lg font-semibold">{totalCount}</span>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 flex justify-between items-center">
          <span className="text-white font-medium">
            {activeTab === 'trustees' ? 'Total Inflow' : 'Total Outflow'}
          </span>
          <span className="text-white text-lg font-semibold">
            {totalFlow ? formatFlow(totalFlow.toString()) : '0 G$'}
          </span>
        </div>
      </div>

      {/* Table Headers */}
      <div className="px-6 py-3 border-b border-gray-800">
        <div className="flex justify-between text-gray-400 text-sm font-medium">
          <span>Name</span>
          <span>Amount</span>
        </div>
      </div>

      {/* List Items */}
      <div className="px-6">
        {!listData || listData.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p>No {activeTab === 'trustees' ? 'trustees' : 'trusters'} yet</p>
          </div>
        ) : (
          <div className="space-y-0">
            {listData.map((item) => {
              const account = activeTab === 'trustees'
                ? item.id.split("_")[1]
                : item.id.split("_")[0];

              return (
                <div key={item.id} className="py-4 border-b border-gray-800 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Blockies
                        seed={account.toLowerCase()}
                        size={8}
                        scale={5}
                        className="rounded-full"
                      />
                      <div>
                        <div className="text-white font-medium">
                          {truncateAddress(account)}
                        </div>
                      </div>
                    </div>
                    <div className="text-white font-medium">
                      {formatFlow(item.flowRate.toString())}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pb-20"></div>
    </div>
  );
}
