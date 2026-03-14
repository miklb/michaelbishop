import { DateTime } from "luxon";

export default function(eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (dateObj, format = "dd LLLL yyyy", zone = "utc") => {
        return DateTime.fromJSDate(dateObj, { zone }).toFormat(format);
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
    });

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return the keys used in an object
	eleventyConfig.addFilter("getKeys", target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("stripAutoLinks", function(content) {
		if (!content) return content;
		return content.replace(/<a href="(https?:\/\/[^"]+)">\1<\/a>/g, '$1');
	});

	// Nunjucks equivalents for Liquid array filters
	eleventyConfig.addFilter("where", (array, key, value) => {
		if (!Array.isArray(array)) return [];
		return array.filter(item => item[key] === value);
	});

	eleventyConfig.addFilter("uniq", (array) => {
		if (!Array.isArray(array)) return [];
		return [...new Map(array.map(item => [JSON.stringify(item), item])).values()];
	});

	eleventyConfig.addFilter("size", (value) => {
		if (Array.isArray(value)) return value.length;
		if (typeof value === 'string') return value.length;
		return 0;
	});

	eleventyConfig.addFilter("concat", (a, b) => {
		if (!Array.isArray(a)) a = [];
		if (!Array.isArray(b)) b = [];
		return [...a, ...b];
	});

	eleventyConfig.addFilter("uniqueByKey", (array, key) => {
		if (!Array.isArray(array)) return [];
		const seen = new Set();
		return array.filter(item => {
			const val = item[key];
			if (seen.has(val)) return false;
			seen.add(val);
			return true;
		});
	});

	eleventyConfig.addFilter("date", (dateStr, format = "LLL dd, yyyy") => {
		if (!dateStr) return '';
		const dt = typeof dateStr === 'string'
			? DateTime.fromISO(dateStr, { zone: "utc" })
			: DateTime.fromJSDate(dateStr, { zone: "utc" });
		// Map common strftime-style tokens to Luxon
		const luxonFormat = format
			.replace(/%a/g, 'EEE')
			.replace(/%b/g, 'MMM')
			.replace(/%d/g, 'dd')
			.replace(/%Y/g, 'yyyy')
			.replace(/%B/g, 'LLLL');
		return dt.toFormat(luxonFormat);
	});

};
