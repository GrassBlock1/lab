import path from "node:path";
import sharp from "sharp";

// relative to project root
const avatarSrc = path.resolve("src/assets/img/avatar.png");

// formats
const formats = {
	png: "image/png",
	webp: "image/webp",
	avif: "image/avif",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
};

// 静态渲染：构建时把每种格式都生成一份
export function getStaticPaths() {
	return Object.keys(formats).map((format) => ({ params: { format } }));
}

export async function GET({ params }) {
	const contentType = formats[params.format];

	if (!contentType) {
		return new Response("Unsupported format", {
			status: 404,
			headers: { "Content-Type": "text/plain" },
		});
	}

	// sharp treats jpg files with jpeg
	const format = params.format === "jpg" ? "jpeg" : params.format;

	const buffer = await sharp(avatarSrc).toFormat(format).toBuffer();

	return new Response(buffer, {
		headers: {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
