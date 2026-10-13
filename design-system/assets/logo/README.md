# jouleWise logo

All files are SVG, drawn in the ergOS Harmony brand. Type is Urbanist (converted to outlines, so no font is needed); the “o” is a glass orb with the J-and-wave glyph.

| File | Use |
| --- | --- |
| `joulewise-dark.svg` | Glass wordmark for dark grounds (`canvas` dark, charcoal). Default on screens. |
| `joulewise-light.svg` | Glass wordmark for light grounds (`canvas` light, white). |
| `joulewise-mark.svg` | The glass orb alone: avatars, loaders, the onboarding hero. Transparent ground. |
| `joulewise-app-icon.svg` | App and favicon tile: charcoal square, Harmony glow, the orb. |
| `joulewise-classic-glass.svg` | Classic 2D glass in the original gold (#CEAB0E) and brown (#4D3C00), for light grounds: documents, partner decks, print. |
| `joulewise-classic-glass-dark.svg` | Classic 2D glass for dark grounds; “Wise” in cream (#F3EAC3). |
| `joulewise-classic-mark.svg` | The classic flat glass disc alone. |
| `joulewise-mono.svg` | One colour, `currentColor` (inline the SVG to colour it). Print, engraving, embroidery. |

Rules: keep clear space of one orb diameter; minimum wordmark width 120 px on screen (use the orb or app icon below that); never put a dark-ground file on white; don't recolour, stretch, rotate or add effects. To change them, edit and run `python3 tools/logo/build_logo.py` (letter outlines are stored in `tools/logo/wordmark-outlines.json`; `tools/logo/outlines.py` remakes them from the Urbanist font).
