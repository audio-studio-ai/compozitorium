help: ## Help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

run: ## Rnn dev (gui)
	@bun run tauri dev

run-web: ## Run dev (web)
	@bun run dev

RELEASE := release
NAME := compozitorium
TARGET := $(if $(CARGO_TARGET_DIR),$(CARGO_TARGET_DIR),src-tauri/target)
VERSION := $(shell sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' src-tauri/tauri.conf.json | head -1 | tr -d .)

# Готовые пакеты складываются в $(RELEASE)/ как $(NAME)_$(VERSION)_<платформа>.<ext>
collect = @mkdir -p $(RELEASE) && for f in $(1); do cp -f "$$f" "$(RELEASE)/$(NAME)_$(VERSION)_$(2).$${f\#\#*.}"; done && ls -1sh $(RELEASE)

build: ## Create Linux .deb
	@python3 src-tauri/linux/wrap-catalog.py
	@bun run tauri -- build --bundles deb
	$(call collect,$(TARGET)/release/bundle/deb/*.deb,x64)

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
	$(call collect,$(TARGET)/x86_64-pc-windows-msvc/release/bundle/nsis/*.exe,x64)

ANDROID_STUDIO := $(HOME)/.local/share/JetBrains/Toolbox/apps/android-studio

build-android: ## Create Android APK
	@export ANDROID_HOME="$${ANDROID_HOME:-$$HOME/Android/Sdk}"; ANDROID_HOME="$${ANDROID_HOME%/}"; export ANDROID_HOME; \
	export JAVA_HOME="$(ANDROID_STUDIO)/jbr"; \
	if [ ! -x "$$JAVA_HOME/bin/javac" ]; then echo "Нет JDK: $$JAVA_HOME"; exit 1; fi; \
	if [ ! -d "$$ANDROID_HOME" ]; then echo "Нужно: Android SDK (ANDROID_HOME)"; exit 1; fi; \
	if [ -z "$$NDK_HOME" ]; then export NDK_HOME="$$(ls -d $$ANDROID_HOME/ndk/* 2>/dev/null | tail -1)"; fi; \
	if [ ! -d "$$NDK_HOME" ]; then echo "Нужно: NDK. Android Studio → SDK Manager → SDK Tools → NDK (Side by side)"; exit 1; fi; \
	export PATH="$$JAVA_HOME/bin:$$PATH"; \
	echo "JAVA_HOME=$$JAVA_HOME"; \
	rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android; \
	test -d src-tauri/gen/android || bun run tauri -- android init --ci; \
	bun run tauri -- android build --apk
	$(call collect,src-tauri/gen/android/app/build/outputs/apk/universal/release/*.apk,android)

run-android: ## Run Android app on emulator
	@export ANDROID_HOME="$${ANDROID_HOME:-$$HOME/Android/Sdk}"; ANDROID_HOME="$${ANDROID_HOME%/}"; export ANDROID_HOME; \
	export JAVA_HOME="$(ANDROID_STUDIO)/jbr"; \
	if [ ! -x "$$JAVA_HOME/bin/javac" ]; then echo "Нет JDK: $$JAVA_HOME"; exit 1; fi; \
	if [ -z "$$NDK_HOME" ]; then export NDK_HOME="$$(ls -d $$ANDROID_HOME/ndk/* 2>/dev/null | tail -1)"; fi; \
	export PATH="$$JAVA_HOME/bin:$$ANDROID_HOME/platform-tools:$$ANDROID_HOME/emulator:$$PATH"; \
	adb get-state >/dev/null 2>&1 || { emulator -avd Pixel_9 >/dev/null 2>&1 & adb wait-for-device; }; \
	bun run tauri -- android run
