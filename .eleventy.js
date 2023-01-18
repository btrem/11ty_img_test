const image = require("@11ty/eleventy-img");
const nunjucksDateFilter = require('nunjucks-date-filter');
const path = require('path')

const markdownItCore = require("markdown-it");
let markdownIt = markdownItCore({html: true});


async function pictureShortcode(pictureData) {

    let src = pictureData.src;
    let debug = pictureData.debug;
    let postNumber = pictureData.postNumber || false;

    if (!src) {
        console.log(`Error: no src provided for picture image element for ${postNumber}`);
        return "<!-- Error: no src provided for picture image element. -->";
    }

    let rawImage = `raw_images/${postNumber}/${src}`;
    const imgExt = path.extname(src);
    const imageBaseName = path.basename(src, imgExt);
    const imageUrlPath = `/media/images/${postNumber}/${imageBaseName}`;
    const imageOutputDir = `public_html/${imageUrlPath}`;

    let alt = pictureData.alt || "";
    let formats = pictureData.formats || ['avif', 'webp', null];
    let widths = pictureData.widths || [300, 600, 900, 1200, 1500];
    let sizes = pictureData.sizes || "100vw";
    let loading = pictureData.loading || "lazy";
    let decoding = pictureData.decoding || "async";
    let classAttribute = pictureData.classAttribute ? `class="${pictureData.classAttribute}"` : '';

    try {
        metadata = await image(rawImage, {
            widths: widths,
            formats: formats,
            outputDir: imageOutputDir,
            urlPath: imageUrlPath
        });
    } catch (e) {
        console.log(e.message);
        return "<!-- Error: could not process rawImage (maybe the file doesn't exist?) -->";
    }

    let highsrc, lowsrc;
    if (metadata.jpeg) {
        lowsrc = metadata.jpeg[0];
        highsrc = metadata.jpeg[metadata.jpeg.length - 1];
    }
    else {
        lowsrc = metadata.png[0];
        highsrc = metadata.png[metadata.png.length - 1];
    }

    return `<picture>
        ${Object.values(metadata).map(imageFormat => {
        return `<source srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}" type="${imageFormat[0].sourceType}">`;
        }).join("\n\t")}
    <img ${classAttribute}
        src="${lowsrc.url}"
        alt="${alt}"
        loading="${loading}"
        decoding="${decoding}">
</picture>`;
}


module.exports = function(eleventyConfig) {

    eleventyConfig.addLayoutAlias('article', 'article.njk');
    eleventyConfig.addLayoutAlias('base', 'base.njk');
    eleventyConfig.addLayoutAlias('post', 'post.njk');

    eleventyConfig.setLibrary("md", markdownIt);

    eleventyConfig.addNunjucksFilter('njkDate', nunjucksDateFilter);

    eleventyConfig.addPassthroughCopy('src/assets');

    eleventyConfig.addNunjucksAsyncShortcode("picture", pictureShortcode);

    eleventyConfig.setBrowserSyncConfig({
        open: true,
        middleware: [
            function (req, res, next) {
                if (/^[^.]+$/.test(req.url)) {
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                }
                next();
            }
        ]
    });


    return {

        markdownTemplateEngine: "njk",

        dir: {
            input: 'src',
            layouts: '_templates',
            output: 'public_html'
        }

    };
};
