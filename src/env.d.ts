/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly DISCORD_CLIENT_ID: string;
	readonly DISCORD_CLIENT_SECRET: string;
	readonly ENCRIPTION_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
