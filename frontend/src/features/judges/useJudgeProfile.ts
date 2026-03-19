import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useUsageStore } from '@/lib/stores/usage.store';

export interface JudgeProfile {
  ideological_tendency: string;
  profile_summary: string;
  known_for: string[];
}

export interface JudgeResponse {
  judge_name: string;
  profile: JudgeProfile;
  recent_judgments: any[];
  stats: {
    total_found: number;
  };
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const useJudgeProfile = (judgeName: string) => {
  const setUsage = useUsageStore((state) => state.setUsage);

  return useQuery<JudgeResponse>({
    queryKey: ['judge-profile', judgeName],
    queryFn: async () => {
      if (!judgeName) throw new Error('Judge name is required');
      const response = await apiClient.get<JudgeResponse>(`/judges/${encodeURIComponent(judgeName)}`);
      setUsage(response.usage);
      return response;
    },
    enabled: !!judgeName && judgeName.length >= 3,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
  });
};
