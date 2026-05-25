/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORCE_LOCAL_RESUME_ANALYSIS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
