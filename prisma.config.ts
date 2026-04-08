import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_bPD8cBFX2pJw@ep-snowy-band-amjlni50-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});