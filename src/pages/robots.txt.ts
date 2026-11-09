import type { APIRoute } from "astro";
import { siteConfig } from "@/config";

// common AI crawlers, note that not all of them respect robots.txt
const AI_CRAWLERS = [
	"Amazonbot",
	"Applebot-Extended",
	"Bytespider",
	"CCBot",
	"ClaudeBot",
	"Diffbot",
	"Google-Extended",
	"GPTBot",
	"omgili",
	"anthropic-ai",
	"Claude-Web",
	"cohere-ai",
	"MistralAI-Training",
	"meta-externalagent",
	"GoogleOther",
	"Baiduspider",
	"PetalBot",
	"AwarioSmartBot",
	"AwarioRssBot",
	"Google-CloudVertexBot",
	"QualifiedBot",
	"Cotoyogi",
	"ICC-Crawler",
	"atlassian-bot",
	"FishBot",
	"BorderxBot",
	"NavuBot",
	"SemrushBot-SWA",
	"WARDBot",
	"magpie-crawler",
	"KimiBot",
	"CitibotSiteCrawler",
	"OAI-SearchBot",
	"ChatGPT-User",
	"PerplexityBot",
	"FacebookBot",
	"YouBot",
	"ExaSearchBot",
	"ElevenlabsCrawler",
];

function addDirective(
	groups: Map<string, string[]>,
	agent: string,
	directive: string,
) {
	const directives = groups.get(agent);
	if (directives) {
		directives.push(directive);
	} else {
		groups.set(agent, [directive]);
	}
}

function toComment(text: string): string {
	return text
		.trim()
		.split(/\r?\n/)
		.map((line) => {
			const content = line.replace(/^\s*#+\s*/, "").trimEnd();
			return content ? `# ${content}` : "#";
		})
		.join("\n");
}

function getRobotsTxt(sitemapURL: URL | null): string {
	const { customText, presets, custom } = siteConfig.robots;
	// rules grouped by user-agent, in the order they are declared
	const groups = new Map<string, string[]>();

	// custom rules are prepended to the rules of their user-agent
	for (const rule of custom) {
		if ("allow" in rule && rule.allow) {
			addDirective(groups, rule.allow, `Allow: ${rule.path}`);
		}
		if ("disallow" in rule && rule.disallow) {
			addDirective(groups, rule.disallow, `Disallow: ${rule.path}`);
		}
	}

	// the default rule for every user-agent
	addDirective(groups, "*", presets.disallowAll ? "Disallow: /" : "Disallow:");

	if (presets.disallowAI) {
		for (const crawler of AI_CRAWLERS) {
			addDirective(groups, crawler, "Disallow: /");
		}
	}

	const blocks = Array.from(
		groups,
		([agent, directives]) => `User-agent: ${agent}\n${directives.join("\n")}`,
	);
	let content = `${blocks.join("\n\n")}\n`;
	if (sitemapURL) {
		content += `\nSitemap: ${sitemapURL.href}\n`;
	}

	return customText ? `${toComment(customText)}\n\n${content}` : content;
}

export const GET: APIRoute = ({ site }) => {
	if (!siteConfig.robots.generate) {
		return new Response(null, { status: 404 });
	}

	const sitemapURL = siteConfig.robots.sitemap
		? new URL("sitemap-index.xml", site)
		: null;
	return new Response(getRobotsTxt(sitemapURL));
};
