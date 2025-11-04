'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IntegrationCard from './components/IntegrationCard';
import ActivityFeed from './components/ActivityFeed';
import AnalyticsChart from './components/AnalyticsChart';
import AISummaryCard from './components/AISummaryCard';
import DashboardAuth from './components/DashboardAuth';
import Button from '@/components/Button';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleSyncGitHub = async () => {
    if (!integrations?.github_connected) {
      setSyncMessage('GitHub not connected. Go to Settings to connect.');
      setTimeout(() => setSyncMessage(''), 3000);
      return;
    }

    setSyncing(true);
    setSyncMessage('Syncing GitHub data...');
    
    try {
      const response = await fetch('/api/github/sync', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setSyncMessage(`✓ Synced ${data.synced.commits} commits and ${data.synced.pullRequests} PRs!`);
        fetchIntegrations();
        // Refresh the page to show new activities
        window.location.reload();
      } else {
        setSyncMessage('Failed to sync GitHub data');
      }
    } catch (error) {
      console.error('Error syncing GitHub:', error);
      setSyncMessage('Error syncing GitHub data');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const handleConnectIntegration = (name: string) => {
    router.push('/dashboard/settings?tab=integrations');
  };

  return (
    <DashboardAuth>
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <DashboardAuth.Header />

            {/* Sync Status Message */}
            {syncMessage && (
              <div className={`mb-4 p-4 rounded-lg backdrop-blur-xl border shadow-lg ${
                syncMessage.includes('✓') ? 'bg-green-500/10 text-green-300 border-green-500/30' : 
                syncMessage.includes('Error') || syncMessage.includes('Failed') ? 'bg-red-500/10 text-red-300 border-red-500/30' :
                'bg-blue-500/10 text-blue-300 border-blue-500/30'
              }`}>
                {syncMessage}
              </div>
            )}

            {/* AI Summary Card */}
            <div className="mb-8">
              <AISummaryCard />
            </div>

            {/* Integrations Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Integrations</h2>
                {integrations?.github_connected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncGitHub}
                    disabled={syncing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync GitHub'}
                  </Button>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <IntegrationCard
                  name="GitHub"
                  icon="github"
                  connected={integrations?.github_connected || false}
                  onConnect={() => handleConnectIntegration('GitHub')}
                />
                <IntegrationCard
                  name="Slack"
                  icon="slack"
                  connected={integrations?.slack_connected || false}
                  onConnect={() => handleConnectIntegration('Slack')}
                />
                <IntegrationCard
                  name="Notion"
                  icon="notion"
                  connected={integrations?.notion_connected || false}
                  onConnect={() => handleConnectIntegration('Notion')}
                />
                <IntegrationCard
                  name="Calendar"
                  icon="calendar"
                  connected={integrations?.calendar_connected || false}
                  onConnect={() => handleConnectIntegration('Calendar')}
                />
              </div>
              {integrations?.last_synced_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Last synced: {new Date(integrations.last_synced_at).toLocaleString()}
                </p>
              )}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
              <ActivityFeed 
                selectedSource={selectedSource}
                onSourceChange={setSelectedSource}
                integrations={integrations}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Weekly Analytics</h2>
              <AnalyticsChart />
            </div>
          </div>
        </div>
      </div>
    </DashboardAuth>
  );
}
