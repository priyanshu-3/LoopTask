import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-client-secret',
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // TODO: Store user in Supabase when credentials are configured
      // Uncomment this when Supabase is set up:
      /*
      if (!user.email) return false;

      const { supabaseAdmin } = await import('./supabaseClient');
      
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        await supabaseAdmin.from('users').insert({
          email: user.email,
          name: user.name,
          image: user.image,
        });

        const { data: newUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (newUser) {
          await supabaseAdmin.from('integrations').insert({
            user_id: newUser.id,
            github_connected: account?.provider === 'github',
            slack_connected: false,
            notion_connected: false,
            calendar_connected: account?.provider === 'google',
            github_token: account?.provider === 'github' ? account.access_token : null,
            calendar_token: account?.provider === 'google' ? account.access_token : null,
          });
        }
      }
      */

      return true;
    },
    async session({ session, token }) {
      // TODO: Add user ID from Supabase when configured
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
};
