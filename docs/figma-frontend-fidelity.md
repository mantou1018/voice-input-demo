# Figma Frontend Fidelity Workflow

This project targets a 414 x 896 mobile frame. Use that size as the primary
comparison baseline unless the Figma source changes the product requirement.

## Component Boundaries

- `src/App.tsx` owns voice-session state, transcript flow, manual edits, picker
  state, and submit/retry handlers.
- `src/components/voiceApply/JobScreen.tsx` owns the job detail entry screen.
- `src/components/voiceApply/ApplyScreen.tsx` owns the voice application overlay
  and composes chat, form prompt, actions, and picker sheets.
- `src/components/voiceApply/SuccessScreen.tsx` owns the post-submit success and
  recommendation state.
- `src/components/voiceApply/*PickerSheet.tsx` files own bottom-sheet states that
  should be compared separately against Figma.

## Fidelity Checklist

- Capture the target Figma frame at 414 x 896 before editing styles.
- Verify exported assets against `src/assets`: background, bottom glow, close
  icon, mic icon, check icon, voice tag, and assistant avatar.
- Compare these states independently:
  - job detail entry screen
  - voice overlay while recording
  - voice overlay while extracting
  - review state with detected fields
  - age picker
  - city picker
  - phone editor
  - position picker
  - success screen
- For each state, check copy, x/y placement, typography size and weight, color,
  radius, button dimensions, sheet height, safe-area behavior, and overflow.

## Implementation Rules

- Keep business logic in `App.tsx`; only move visual concerns into
  `src/components/voiceApply`.
- Do not introduce a UI framework for Figma parity work.
- Prefer replacing assets with Figma exports over recreating raster visuals with
  CSS.
- Preserve native text and controls for interactive UI; do not ship screenshots
  as UI.
- Run `npm run build` after structural changes and `npm test` after logic or
  input-handling changes.
