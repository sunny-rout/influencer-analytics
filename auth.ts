import NextAuth from 'next-auth';
import Google      from 'next-auth/providers/google';
import Facebook    from 'next-auth/providers/facebook';
import Instagram   from 'next-auth/providers/instagram';
import Credentials from 'next-auth/providers/credentials';
import bcrypt      from 'bcryptjs';
import { z }       from 'zod';
import { db }      from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ← No adapter — we handle DB manually in callbacks

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  providers: [
    Google({
      clientId:     process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Facebook({
      clientId:     process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    }),

    Instagram({
      clientId:     process.env.INSTAGRAM_APP_ID!,
      clientSecret: process.env.INSTAGRAM_APP_SECRET!,
    }),

    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const parsed = z.object({
          email:    z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const result = await db.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );
        const user = result.rows[0];

        if (!user || !user.password_hash) return null;

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
          role:  user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Handle OAuth users — save to DB on first sign in
    async signIn({ user, account }) {
      // Only handle OAuth providers here
      // Credentials are handled in authorize() above
      if (account?.provider === 'credentials') return true;

      try {
        // Check if user already exists
        const existing = await db.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );

        if (existing.rows.length === 0) {
          // Create new user for OAuth sign in
          await db.query(`
            INSERT INTO users (name, email, image, email_verified)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (email) DO UPDATE SET
              name  = EXCLUDED.name,
              image = EXCLUDED.image
          `, [user.name, user.email, user.image]);
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },

    // Add user id and role to JWT
    async jwt({ token, user }) {
      if (user) {
        // Fetch full user from DB to get id and role
        const result = await db.query(
          'SELECT id, role FROM users WHERE email = $1',
          [token.email]
        );
        if (result.rows[0]) {
          token.id   = result.rows[0].id;
          token.role = result.rows[0].role;
        }
      }
      return token;
    },

    // Add id and role to session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string;
        // session.user.role = token.role as string;
      }
      return session;
    },
  },
});