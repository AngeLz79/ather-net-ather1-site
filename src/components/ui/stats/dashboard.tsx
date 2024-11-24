import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StatCard } from '@/components/ui/stats/Statcard'
import { ChartCard } from '@/components/ui/stats/ChartCard';
import { DetailsResponse, DetailsTrendsResponse } from '@/types/ather';
import AtherSocketClient from '@/components/utils/ather';

type TokenOrKey = "token" | "access_key";
const tokenOrKey: TokenOrKey = "token";

const config = {
  token: "hpoZWXPi7N3uEfZN8gF3a",
  token_type: tokenOrKey
};

export const Dashboard: React.FC = () => {
  const atherRef = useRef<AtherSocketClient | null>(null);
  const [details, setDetails] = useState<DetailsResponse | null>(null);
  const [trends, setTrends] = useState<DetailsTrendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!atherRef.current) return;
    
    try {
      setIsLoading(true);
      const detailsData = await atherRef.current.archive.details();
      const trendsData = await atherRef.current.archive.detailsOvertime(120);
      setDetails(detailsData);
      setTrends(trendsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAther = async () => {
      if (!atherRef.current) {
        const ather = new AtherSocketClient();
        await ather.login(config.token, config.token_type);
        atherRef.current = ather;
        
        ather.on('ready', fetchDetails);
        
        fetchDetails(); // Initial fetch
      }
    };

    initializeAther();

    const intervalId = setInterval(fetchDetails, 2000);

    return () => {
      clearInterval(intervalId);
      if (atherRef.current) {
        atherRef.current.removeListener('ready', fetchDetails);
      }
    };
  }, [fetchDetails]);

  if (isLoading && !details && !trends) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!details || !trends) return null;

  return (
    <div className="container-fluid min-h-screen bg-gray-800 text-gray-100 p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to the Arch!</h1>
        <p className="text-xl">Where the Past Lives On, Forever Engraved in the Unforgettable Logs of Time.</p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard 
            title="Archived Messages" 
            count={details.messageCount} 
            trend={trends.messages} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Archived Guilds" 
            count={details.guildCount} 
            trend={trends.guilds} 
            color="bg-red-500" 
          />
          <StatCard 
            title="Archived Channels" 
            count={details.channelCount} 
            trend={trends.channels} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Archived Users" 
            count={details.userCount} 
            trend={trends.users} 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Archived Files" 
            count={details.cacheCount} 
            trend={trends.files} 
            color="bg-purple-500" 
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ChartCard title="Messages" data={trends.messages} color="rgba(34, 197, 94, 0.7)" />
          <ChartCard title="Guilds" data={trends.guilds} color="rgba(239, 68, 68, 0.7)" />
          <ChartCard title="Channels" data={trends.channels} color="rgba(59, 130, 246, 0.7)" />
          <ChartCard title="Users" data={trends.users} color="rgba(234, 179, 8, 0.7)" />
          <ChartCard title="Files" data={trends.files} color="rgba(168, 85, 247, 0.7)" />
        </div>
      </section>
    </div>
  );
};

