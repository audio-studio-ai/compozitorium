# Compozitorium AI Studio

Десктоп-приложение на Tauri 2 + React. Нужны [Bun](https://bun.sh) и [Rust](https://rustup.rs).

## Запуск

```shell
make run
```

Окно приложения (`tauri dev`). Только браузер:

```shell
make run-web
```

## Сборка

### Linux

```shell
make build
```

Пакет: `src-tauri/target/release/bundle/deb/compozitorium-ai-studio_*.deb`

### Windows

С Linux (кросс через cargo-xwin):

```shell
sudo apt install llvm lld nsis clang
make build-windows
```

Инсталлятор: `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/`

На самой Windows достаточно `make build-windows` (без xwin).

### Android

1. JetBrains Toolbox → Android Studio (JDK берётся из `~/.local/share/JetBrains/Toolbox/apps/android-studio/jbr`).
2. SDK: по умолчанию `~/Android/Sdk` (`ANDROID_HOME`).
3. Android Studio → SDK Manager → SDK Tools → **NDK (Side by side)**.
4. Для запуска — эмулятор AVD **Pixel_9**.

```shell
make build-android
make run-android
```

APK: `src-tauri/gen/android/app/build/outputs/apk/`

`run-android` поднимает Pixel_9, если `adb` ещё не видит устройство.

### macOS

Пока не собирается.
