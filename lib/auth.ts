import { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import User from '@/models/User';

// Extend session type
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      hostel?: string;
      karmaScore?: number;
      role?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      // Block non-IITGN emails
      if (!user.email?.endsWith('@iitgn.ac.in')) {
        return false;
      }

      // Upsert user in MongoDB
      try {
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              name: user.name ?? 'IITGN User',
              email: user.email,
              image: user.image ?? '',
              karmaScore: 10,
              role: 'buyer',
              isVerified: true,
            },
          },
          { upsert: true, new: true }
        );
      } catch (e) {
        console.error('User upsert failed:', e);
      }

      return true;
    },

    async jwt({ token, user }) {
      // Fetch from DB on first sign-in OR whenever id is missing (e.g. cold start)
      if (user?.email || (!token.id && token.email)) {
        const email = (user?.email ?? token.email) as string;
        try {
          await connectDB();
          const dbUser = await User.findOne({ email }).lean() as {
            _id: { toString(): string };
            hostel?: string;
            karmaScore?: number;
            role?: string;
          } | null;
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.hostel = dbUser.hostel;
            token.karmaScore = dbUser.karmaScore;
            token.role = dbUser.role;
          }
        } catch (e) {
          console.error('JWT callback error:', e);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.hostel = token.hostel as string | undefined;
        session.user.karmaScore = token.karmaScore as number | undefined;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
};
