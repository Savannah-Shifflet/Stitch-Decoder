import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { tableSchema, appSchema } from "@nozbe/watermelondb";

// Schema mirrors key Supabase tables for offline-first access
const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "patterns",
      columns: [
        { name: "server_id", type: "string", isOptional: true },
        { name: "title", type: "string" },
        { name: "raw_text", type: "string" },
        { name: "processed_json", type: "string", isOptional: true }, // JSON string
        { name: "size_params", type: "string", isOptional: true },    // JSON string
        { name: "source", type: "string" },
        { name: "region", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "synced_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "user_projects",
      columns: [
        { name: "server_id", type: "string", isOptional: true },
        { name: "pattern_id", type: "string" },
        { name: "name", type: "string" },
        { name: "status", type: "string" },
        { name: "notes", type: "string", isOptional: true },
        { name: "progress_row", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "abbreviations",
      columns: [
        { name: "server_id", type: "string", isOptional: true },
        { name: "term", type: "string" },
        { name: "expansion", type: "string" },
        { name: "category", type: "string" },
        { name: "region", type: "string" },
        { name: "is_global", type: "boolean" },
      ],
    }),
  ],
});

const adapter = new SQLiteAdapter({
  schema,
  dbName: "stitch_decoder",
  jsi: true, // Use JSI for better performance on supported platforms
  onSetUpError: (error) => {
    console.error("WatermelonDB setup error:", error);
  },
});

export const database = new Database({ adapter, modelClasses: [] });
