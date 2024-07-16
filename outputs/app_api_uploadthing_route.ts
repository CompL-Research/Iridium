import { createNextRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/app/api/uploadthing/core.ts";

// Export routes for Next App Router
var _createNextRouteHandl = createNextRouteHandler({
    router: ourFileRouter
  }),
  GET = _createNextRouteHandl.GET,
  POST = _createNextRouteHandl.POST;
export { GET, POST };