'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import Button from '@/components/Button';
import DashboardAuth from '../components/DashboardAuth';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Key,
  Palette,
  Globe,
  Trash2,
  Save,
  Github,
  Mail,
  Slack,
  FileText
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'integrations', label: 'Integrations', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <DashboardAuth>
      <div className="p-4 md:p-8">
        
        <main className="max-w-7xl mx-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar Tabs */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </LiquidGlassCard>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                {activeTab === 'profile' && (
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold">
                          {session?.user?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <Button variant="outline" size="sm">Change Avatar</Button>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue={session?.user?.name || ''}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={session?.user?.email || ''}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Bio</label>
                        <textarea
                          rows={4}
                          placeholder="Tell us about yourself..."
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end space-x-3">
                        <Button variant="outline">Cancel</Button>
                        <Button variant="primary" className="flex items-center space-x-2">
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </Button>
                      </div>
                    </div>
                  </LiquidGlassCard>
                )}

                {activeTab === 'integrations' && (
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    <h2 className="text-2xl font-bold mb-6">Integrations</h2>
                    
                    <div className="space-y-4">
                      {[
                        { name: 'GitHub', icon: Github, connected: true, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-500' },
                        { name: 'Slack', icon: Slack, connected: false, bgColor: 'bg-pink-500/10', iconColor: 'text-pink-500' },
                        { name: 'Notion', icon: FileText, connected: false, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
                        { name: 'Google Calendar', icon: Mail, connected: false, bgColor: 'bg-green-500/10', iconColor: 'text-green-500' },
                      ].map((integration) => {
                        const Icon = integration.icon;
                        return (
                          <div
                            key={integration.name}
                            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-xl ${integration.bgColor} flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${integration.iconColor}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{integration.name}</h3>
                                <p className="text-sm text-gray-400">
                                  {integration.connected ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant={integration.connected ? 'secondary' : 'primary'}
                              size="sm"
                            >
                              {integration.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </LiquidGlassCard>
                )}

                {activeTab === 'notifications' && (
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-6">
                      {[
                        { label: 'Email Notifications', description: 'Receive email updates about your activity' },
                        { label: 'Slack Notifications', description: 'Get notified in Slack for important events' },
                        { label: 'Daily Summary', description: 'Receive daily AI-generated summary' },
                        { label: 'PR Reminders', description: 'Get reminded about pending pull requests' },
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{setting.label}</h3>
                            <p className="text-sm text-gray-400">{setting.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </LiquidGlassCard>
                )}

                {activeTab === 'appearance' && (
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    <h2 className="text-2xl font-bold mb-6">Appearance</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">Theme</label>
                        <div className="grid grid-cols-3 gap-4">
                          {['Dark', 'Light', 'Auto'].map((theme) => (
                            <button
                              key={theme}
                              className={`p-4 rounded-lg border-2 transition-colors ${
                                theme === 'Dark'
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div className="text-center">
                                <div className={`w-12 h-12 mx-auto mb-2 rounded-lg ${
                                  theme === 'Dark' ? 'bg-gray-900' : theme === 'Light' ? 'bg-white' : 'bg-gradient-to-br from-gray-900 to-white'
                                }`}></div>
                                <span className="text-sm font-medium">{theme}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-3">Accent Color</label>
                        <div className="flex space-x-3">
                          <button className="w-10 h-10 rounded-full bg-blue-500 hover:scale-110 transition-transform ring-2 ring-white ring-offset-2 ring-offset-gray-900" />
                          <button className="w-10 h-10 rounded-full bg-purple-500 hover:scale-110 transition-transform" />
                          <button className="w-10 h-10 rounded-full bg-pink-500 hover:scale-110 transition-transform" />
                          <button className="w-10 h-10 rounded-full bg-green-500 hover:scale-110 transition-transform" />
                          <button className="w-10 h-10 rounded-full bg-orange-500 hover:scale-110 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                )}

                {activeTab === 'billing' && (
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    <h2 className="text-2xl font-bold mb-6">Billing & Subscription</h2>
                    
                    <div className="space-y-6">
                      {/* Current Plan */}
                      <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold">Pro Plan</h3>
                            <p className="text-gray-400">$19/month</p>
                          </div>
                          <Button variant="outline" size="sm">Change Plan</Button>
                        </div>
                        <p className="text-sm text-gray-400">Next billing date: November 28, 2025</p>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h3 className="font-semibold mb-3">Payment Method</h3>
                        <div className="p-4 bg-gray-800 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-6 h-6 text-gray-400" />
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-400">Expires 12/25</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </div>

                      {/* Billing History */}
                      <div>
                        <h3 className="font-semibold mb-3">Billing History</h3>
                        <div className="space-y-2">
                          {[
                            { date: 'Oct 28, 2025', amount: '$19.00', status: 'Paid' },
                            { date: 'Sep 28, 2025', amount: '$19.00', status: 'Paid' },
                            { date: 'Aug 28, 2025', amount: '$19.00', status: 'Paid' },
                          ].map((invoice, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">{invoice.date}</p>
                                <p className="text-sm text-gray-400">{invoice.amount}</p>
                              </div>
                              <span className="text-sm text-green-500">{invoice.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                )}

                {activeTab === 'security' && (
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Change Password */}
                      <div>
                        <h3 className="font-semibold mb-3">Change Password</h3>
                        <div className="space-y-3">
                          <input
                            type="password"
                            placeholder="Current password"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <Button variant="primary">Update Password</Button>
                        </div>
                      </div>

                      {/* Two-Factor Auth */}
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-400">Add an extra layer of security</p>
                          </div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                      </div>

                      {/* Delete Account */}
                      <div className="pt-6 border-t border-gray-700">
                        <h3 className="font-semibold text-red-500 mb-3">Danger Zone</h3>
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-500">Delete Account</h4>
                              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </DashboardAuth>
  );
}
