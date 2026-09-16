help: ## Help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

run: ## Rnn dev (gui)
	@bun run tauri dev

run-web: ## Run dev (web)
	@bun run dev

build: ## Create Linux .deb
	@bun run tauri -- build --bundles deb


build-windows: ## Create Windows NSIS (cargo-xwin on Linux/macOS)
ifeq ($(OS),Windows_NT)
	@bun run tauri -- build --target x86_64-pc-windows-msvc --bundles nsis
else
	@rustup target add x86_64-pc-windows-msvc
	@command -v cargo-xwin >/dev/null || cargo install --locked cargo-xwin
	@rc="$$(command -v llvm-rc 2>/dev/null || ls /usr/bin/llvm-rc-* 2>/dev/null | tail -1)"; \
	cl="$$(command -v clang-cl 2>/dev/null || ls /usr/bin/clang-cl-* 2>/dev/null | tail -1)"; \
	if [ -z "$$rc" ] || [ -z "$$cl" ]; then echo "Нужно: sudo apt install llvm lld nsis clang"; exit 1; fi; \
	mkdir -p "$$HOME/.local/bin"; \
	command -v llvm-rc >/dev/null || ln -sfn "$$rc" "$$HOME/.local/bin/llvm-rc"; \
	command -v clang-cl >/dev/null || ln -sfn "$$cl" "$$HOME/.local/bin/clang-cl"
	@command -v makensis >/dev/null || { echo "Нужно: sudo apt install nsis"; exit 1; }
	@PATH="$$HOME/.local/bin:$$PATH" bun run tauri -- build --runner cargo-xwin --target x86_64-pc-windows-msvc --bundles nsis
endif