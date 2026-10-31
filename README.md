# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## Detailed Industrial 3D upgrade
The machine visualizer now uses higher-detail procedural Three.js models for the seven workshop stations:
- Centre lathe
- SMAW welding workstation
- Shaper
- Planer
- Vertical milling machine
- Sand-casting station
- Green-sand moulding station

The models add industrial materials, fasteners, T-slots, handwheels, gauges, spindles, jaws, cutters, motors, guards, gating details, and more realistic proportions. Existing operation simulations and part-selection behavior are retained.

### Run locally
```bash
npm install
npm run dev
```
Then open the Vite local URL shown in the terminal.

### Configure authentication
Authentication is handled by Supabase Auth; the browser must not be given a Supabase service-role key.

1. Create a Supabase project and enable email/password sign-in.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project API settings.
3. Add the local URL and deployed Vercel domain to Supabase Auth's allowed site and redirect URLs. Configure the email confirmation and password-reset templates for those URLs.
4. Add the same two `VITE_` variables to the Vercel project's environment variables, then redeploy.

The app reads the authenticated Supabase session on startup and listens for sign-out/session-expiration events before rendering protected workshop pages. Student profile and progress data remain local to the authenticated browser; they are not used to authorize access. No demo credentials or passwords are stored in the browser.
