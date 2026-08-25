import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: any;
      organization?: any;
      branch?: any;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: any;
    organization?: any;
    branch?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: any;
    organization?: any;
    branch?: any;
  }
}
