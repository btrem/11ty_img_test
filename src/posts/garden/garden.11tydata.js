module.exports = {
    eleventyComputed: {
        featuredImage: {
            postNumber: data => data.number,
        }
    }
};
