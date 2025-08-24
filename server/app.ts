import { createRequestHandler } from "@react-router/express";
import { drizzle } from "drizzle-orm/postgres-js";
import express from "express";
import postgres from "postgres";
import "react-router";

import { DatabaseContext } from "~/database/context";
import * as schema from "~/database/schema";

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

// CORS middleware for API routes
app.use((req, res, next) => {
  // Only handle CORS for API routes
  if (req.path.startsWith('/api/')) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://www.figma.com',
      'https://figma.com',
      'https://motionexport.com',
      'https://www.motionexport.com',
      'http://localhost:3000',
      'null' // Local Figma plugins send 'null' as origin
    ];
    
    const isAllowed = !origin || allowedOrigins.includes(origin);
    const allowOrigin = isAllowed ? (origin || '*') : 'https://motionexport.com';
    
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Plugin-Id, X-Figma-User-Id, X-API-Key');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
  }
  next();
});

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });
app.use((_, __, next) => DatabaseContext.run(db, next));

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
      };
    },
  }),
);
