import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment variables.");
}

const pool = new Pool({
  connectionString,
});

export const checkpointer = new PostgresSaver(pool);

// A setup function that needs to be called once to create necessary tables
let isSetup = false;
export async function setupCheckpointer() {
  if (!isSetup) {
    await checkpointer.setup();
    isSetup = true;
    console.log("Postgres checkpointer setup completed.");
  }
}
