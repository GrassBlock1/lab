import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

//import remarkMath from "remark-math";
//import rehypeKatex from "rehype-katex";

import { satteri } from "@astrojs/markdown-satteri";
//import node from "@astrojs/node";
import partytown from "@astrojs/partytown";
import edgeoneAdapter from "@edgeone/astro";
import expressiveCode from "astro-expressive-code";
import satteriKatex from "satteri-katex";
import { mdastDetectMathPlugin } from "@/plugins/satteri/math-detector.ts";
import { mdastModifiedTimePlugin } from "@/plugins/satteri/modified-time.mjs";
import { mdastSpoilerPlugin } from "@/plugins/satteri/spoiler.ts";
import { mdastReadingTimePlugin } from "@/plugins/satteri/wordcount.js";

export default defineConfig({
	site: "https://lab.gb0.dev",
	base: "/",
	trailingSlash: "ignore",
	redirects: {
		// for the old routes still can be accessed
		"/post/[...slug]": "/blog/[...slug]",
		"/index.xml": "/rss.xml",
		"/feed.rss": "/rss.xml",
	},

	build: {
		format: "directory",
	},

	markdown: {
		shikiConfig: {
			theme: "nord",
			wrap: true,
		},
		processor: satteri({
			features: { math: true, rawHtml: true },
			mdastPlugins: [
				mdastDetectMathPlugin,
				satteriKatex(),
				mdastReadingTimePlugin,
				mdastModifiedTimePlugin,
				mdastSpoilerPlugin,
			],
		}),
	},

	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Fusion Pixel 12px Monospaced SC",
			cssVariable: "--font-pixel",
		},
	],

	image: {
		responsiveStyles: true,
		layout: "constrained",
	},

	i18n: {
		locales: [
			"en",
			{
				path: "zh-cn",
				codes: ["zh-CN"],
			},
		],
		defaultLocale: "zh-cn",
		routing: {
			prefixDefaultLocale: false,
		},
	},

	integrations: [sitemap(), expressiveCode(), mdx(), partytown()],

	//adapter: node({
	//	mode: "standalone",
	//}),
	adapter: edgeoneAdapter(),
});
