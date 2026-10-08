{
  "file": {
    "path": "src/components/convex-client-provider.tsx",
    "content": "import { ConvexAuthProvider } from \"@convex-dev/auth/react\";\nimport { ConvexReactClient } from \"convex/react\";\n\nconst CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL\nif (!CONVEX_URL) {\n  console.error('missing envar CONVEX_URL')\n}\nconst convex = new ConvexReactClient(CONVEX_URL)\n\nexport default function AppConvexProvider({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <ConvexAuthProvider client={convex}>\n      {children}\n    </ConvexAuthProvider>\n  )\n}\n",
    "totalLines": 20
  }
}