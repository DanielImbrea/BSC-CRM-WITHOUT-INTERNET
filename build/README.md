Pune aici iconițele aplicației înainte de a face build de producție:

- `icon.icns` — pentru macOS (necesar pentru `electron-builder --mac`)
- `icon.ico` — pentru Windows (necesar pentru `electron-builder --win`)
- `icon.png` (512x512 sau 1024x1024) — pentru Linux

Fără aceste fișiere, electron-builder folosește o iconiță generică implicită —
aplicația tot funcționează, doar arată mai puțin profesional.
