'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import GlassCard from '@/components/ui/glass-card';
import Navbar from '@/components/Navbar';
import { Pricing } from '@/components/ui/pricing';
import { WavyBackground } from '@/components/ui/wavy-background';
import { Github, Calendar, MessageSquare, FileText, Zap, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function GetStartedButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex justify-center items-center space-x-4"
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex justify-center gap-2 items-center shadow-xl text-lg text-black bg-gray-50 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
      >
        Start Free Trial
        <svg
          className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
          viewBox="0 0 16 19"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
            className="fill-gray-800 group-hover:fill-gray-800"
          />
        </svg>
      </button>
      <Link href="#features">
        <Button variant="outline" size="lg">Learn More</Button>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen relative">
        <WavyBackground 
          containerClassName="min-h-screen relative w-full"
          className="w-full"
        >
          {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm text-blue-400 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Workflow Automation</span>
            </span>
          </motion.div>
          
          <h1 className="text-7xl font-bold text-white">
            Automate Your Developer Workflow
          </h1>
          
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Connect GitHub, Notion, Slack, and Google Calendar. Get AI-powered summaries of your daily activities and boost your productivity.
          </p>
          
          <GetStartedButton />

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center space-x-8 pt-12"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">10K+</p>
              <p className="text-sm text-gray-500">Developers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">50K+</p>
              <p className="text-sm text-gray-500">Automations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-400">99.9%</p>
              <p className="text-sm text-gray-500">Uptime</p>
            </div>
          </motion.div>
        </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold text-center mb-4 text-white">
            Powerful Integrations
          </h2>
          <p className="text-center text-white mb-12 max-w-2xl mx-auto">
            Connect all your favorite tools in one place and let AI do the heavy lifting
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Github,
              title: 'GitHub Integration',
              description: 'Track commits, PRs, and code reviews automatically.',
              bgColor: 'bg-blue-500/10',
              iconColor: 'text-blue-500',
              delay: 0,
            },
            {
              icon: Calendar,
              title: 'Google Calendar',
              description: 'Sync meetings and schedule summaries.',
              bgColor: 'bg-green-500/10',
              iconColor: 'text-green-500',
              delay: 0.1,
            },
            {
              icon: MessageSquare,
              title: 'Slack Automation',
              description: 'Post daily summaries to your team channels.',
              bgColor: 'bg-purple-500/10',
              iconColor: 'text-purple-500',
              delay: 0.2,
            },
            {
              icon: FileText,
              title: 'Notion Sync',
              description: 'Create pages for commits and tasks automatically.',
              bgColor: 'bg-yellow-500/10',
              iconColor: 'text-yellow-500',
              delay: 0.3,
            },
            {
              icon: Zap,
              title: 'AI Summaries',
              description: 'GPT-4 powered insights on your productivity.',
              bgColor: 'bg-orange-500/10',
              iconColor: 'text-orange-500',
              delay: 0.4,
            },
            {
              icon: BarChart3,
              title: 'Analytics',
              description: 'Visualize your coding patterns and trends.',
              bgColor: 'bg-pink-500/10',
              iconColor: 'text-pink-500',
              delay: 0.5,
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <GlassCard
                  title={feature.title}
                  icon={
                    <div className={`w-16 h-16 rounded-xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </div>
                  }
                  description={feature.description}
                  className="feature-card h-full cursor-pointer"
                />
              </motion.div>
            );
          })}
        </div>
        </section>

        {/* Pricing Section */}
        <section className="relative z-10">
          <Pricing
            plans={[
              {
                name: 'Basic',
                price: '0',
                features: [
                  '1 User',
                  '1GB Storage',
                  'Community Forum'
                ],
                description: 'Perfect for personal projects and hobbyists.',
                buttonText: 'Get Started',
                href: '/login',
                isPopular: false,
              },
              {
                name: 'Team',
                price: '49',
                features: [
                  '10 Users',
                  '100GB Storage',
                  'Email Support',
                  'Shared Workspaces'
                ],
                description: 'Collaborate with your team on multiple projects.',
                buttonText: 'Choose Team Plan',
                href: '/login',
                isPopular: true,
              },
              {
                name: 'Agency',
                price: '149',
                features: [
                  'Unlimited Users',
                  '1TB Storage',
                  'Dedicated Support',
                  'Client Invoicing'
                ],
                description: 'Manage all your clients under one roof.',
                buttonText: 'Contact Us',
                href: '/login',
                isPopular: false,
              },
            ]}
            title="Simple Pricing"
            description="Choose the plan that fits your needs"
          />
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl p-12 text-center relative overflow-hidden backdrop-blur-[14px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 dark:from-white/10 dark:to-white/5 dark:border-white/10 dark:backdrop-brightness-[0.91]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
          
          <div className="relative z-10">
            <motion.h2
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold mb-4 text-white"
            >
              Ready to Automate Your Workflow?
            </motion.h2>
            <motion.p
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white mb-8 max-w-2xl mx-auto"
            >
              Join thousands of developers who are already saving hours every week with LoopTask
            </motion.p>
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center items-center space-x-4"
            >
              <Link href="/login">
                <button
                  type="button"
                  className="flex justify-center gap-2 items-center shadow-xl text-lg text-black bg-gray-50 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
                >
                  Start Free Trial
                  <svg
                    className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
                    viewBox="0 0 16 19"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                      className="fill-gray-800 group-hover:fill-gray-800"
                    />
                  </svg>
                </button>
              </Link>
              <Button variant="outline" size="lg" className="backdrop-blur-md bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80">
                Schedule Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <span className="text-xl font-bold">LoopTask</span>
              </div>
              <p className="text-gray-400 text-sm">
                Automate your developer workflow with AI-powered insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Built with ❤️ by Ayush Kumar
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              © 2025 LoopTask. All rights reserved.
            </p>
          </div>
        </div>
        </footer>
        </WavyBackground>
      </main>
    </>
  );
}
