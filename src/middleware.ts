import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/doctors/:path*",
    "/appointments/:path*",
    "/admissions/:path*",
    "/wards/:path*",
    "/inventory/:path*",
    "/billing/:path*",
  ],
};
