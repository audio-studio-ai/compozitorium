help: ## Help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

run: ## Rnn dev (gui)
	@bun run tauri dev

run-web: ## Run dev (web)
	@bun run dev

build: ## Create Linux .deb
	@bun run tauri -- build --bundles deb
