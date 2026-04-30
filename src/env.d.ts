/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WHATSAPP_NUMBER: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
