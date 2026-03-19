# Important Database Migration Step

During the implementation of persistent thread storage for LangGraph agents, the `ChatThread` model was added to `database/prisma/schema.prisma` to allow users to view their past conversation history on the frontend sidebar.

Because Docker Hub rate limiting prevented the local PostgreSQL container from starting during development, the database migration could not be applied automatically.

**You MUST run the following command to apply the changes to your database before starting the application:**

```bash
npx prisma migrate dev --name add_chat_threads --schema database/prisma/schema.prisma
```

This will create the necessary `ChatThread` table in your PostgreSQL database, alongside the LangGraph checkpointer tables (which are automatically created via `setupCheckpointer()`).
