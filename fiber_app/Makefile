.PHONY: run build tidy migrate

run:
	go run ./cmd/server/main.go

build:
	go build -o bin/server ./cmd/server/main.go

tidy:
	go mod tidy

# Run migrations manually — paste into Supabase SQL editor or use:
# psql $DATABASE_URL -f internal/db/migrations/001_initial_schema.sql
migrate:
	@echo "Run migration files in order against your Supabase project:"
	@echo "  1. internal/db/migrations/001_initial_schema.sql"
	@echo "  2. internal/db/migrations/002_rls_policies.sql"
	@echo "  3. internal/db/migrations/003_seed_yarn_weights.sql"
	@echo ""
	@echo "Paste each file into Supabase SQL Editor at:"
	@echo "  https://supabase.com/dashboard/project/bjjyiyaevsncybbyhcdf/sql"
