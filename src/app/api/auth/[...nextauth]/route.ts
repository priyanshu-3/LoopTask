import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only proceed if we have Supabase configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('Supabase not configured, skipping user creation');
        return true;
      }

      if (!user.email) return false;

      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          // Create new user
          const { data: newUser, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
              email: user.email,
              name: user.name,
              image: user.image,
            })
            .select('id')
            .single();

          if (userError) {
            console.error('Error creating user:', userError);
            return true; // Still allow sign in even if DB insert fails
          }

          // Create integrations record
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
        } else {
          // Update existing user's tokens
          await supabaseAdmin
            .from('integrations')
            .upsert({
              user_id: existingUser.id,
              github_connected: account?.provider === 'github',
              calendar_connected: account?.provider === 'google',
              github_token: account?.provider === 'github' ? account.access_token : null,
              calendar_token: account?.provider === 'google' ? account.access_token : null,
            }, {
              onConflict: 'user_id'
            });
        }
      } catch (error) {
        console.error('Error in signIn callback:', error);
        // Still allow sign in even if DB operations fail
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
