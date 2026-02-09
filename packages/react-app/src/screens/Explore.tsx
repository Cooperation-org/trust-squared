import { useState } from "react";
import { useGenericQuery } from "@/hooks/queries/useGenericQuery";
import { formatScore, truncateAddress } from "@/utils";
import { ArrowLeft, Bell, Search, Users } from "lucide-react";
import Blockies from "react-blockies";
import { Link, useNavigate } from "react-router-dom";

interface CommunityMember {
  id: string;
  trustScore: string;
  inFlowRate: string;
  trusters: { id: string }[];
}

interface MembersResponse {
  data: {
    members: CommunityMember[];
  };
}

const fetchMembers = async (orderBy: string) => {
  return fetch(
    "https://api.studio.thegraph.com/query/59211/trustsquared/version/latest",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            members(first: 50, orderBy: ${orderBy}, orderDirection: desc) {
              id
              trustScore
              inFlowRate
              trusters {
                id
              }
            }
          }
        `,
      }),
    }
  ).then((res) => res.json()) as Promise<MembersResponse>;
};

type SortMode = "trustScore" | "inFlowRate";

export default function Explore() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortMode>("trustScore");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, status } = useGenericQuery(
    ["community", sortBy],
    () => fetchMembers(sortBy)
  );

  const members = data?.data?.members || [];
  const filteredMembers = searchQuery
    ? members.filter((m) => m.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : members;

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-800 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h1 className="text-white font-semibold text-lg">Explore Community</h1>
        </div>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>

      <div className="px-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 border border-gray-800 focus:border-green-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("trustScore")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === "trustScore"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Highest Trust Score
          </button>
          <button
            onClick={() => setSortBy("inFlowRate")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === "inFlowRate"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Most Supported
          </button>
        </div>

        {/* Members List */}
        {status === "pending" ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const score = formatScore(member.trustScore);
              const supporterCount = member.trusters?.length || 0;

              return (
                <div
                  key={member.id}
                  className="bg-gray-900/80 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Blockies
                      seed={member.id.toLowerCase()}
                      size={8}
                      scale={5}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm">
                        {truncateAddress(member.id)}
                      </p>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Users className="h-3 w-3" />
                        <span>
                          {supporterCount} Supporter{supporterCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-green-400 text-lg font-bold">{score}</p>
                      <p className="text-gray-500 text-xs">TRUST SCORE</p>
                    </div>
                    <Link
                      to={`/trust?address=${member.id}`}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Support
                    </Link>
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
