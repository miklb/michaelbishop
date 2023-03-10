module.exports = (ctx) => ({
    map: ctx.options.map,
    plugins: {
        'postcss-import': { path: 'assets/css' },
        'postcss-nested': {},
        'postcss-preset-env': {},
        'postcss-custom-properties': {},
        'postcss-combine-duplicated-selectors': { removeDuplicatedProperties: true },
        cssnano: { preset: 'default' },
    }
})