{
  "file": {
    "path": "src/routes/__root.tsx",
    "content": "import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'\nimport { MacalyBridge } from '@macaly/bridge'\nimport AppConvexProvider from '@/components/convex-client-provider'\nimport '../styles.css'\nimport siteMetadata from '../metadata.json'\n\nconst rootMeta = siteMetadata['/']\n\nexport const Route = createRootRoute({\n  head: () => ({\n    meta: [\n      { charSet: 'utf-8' },\n      { name: 'viewport', content: 'width=device-width, initial-scale=1' },\n      { title: rootMeta.title },\n      { name: 'description', content: rootMeta.description },\n    ],\n    links: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],\n  }),\n  shellComponent: RootDocument,\n})\n\nfunction RootDocument({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang=\"en\" suppressHydrationWarning>\n      <head><HeadContent /></head>\n      <MacalyBridge>\n        <body>\n          <AppConvexProvider>{children}</AppConvexProvider>\n          <Scripts />\n        </body>\n      </MacalyBridge>\n    </html>\n  )\n}\n",
    "totalLines": 34
  }
}