module.exports = (ctx) => ({
    map: ctx.options.map,
    plugins: {
        'postcss-import': { path: 'assets/css' },
        'postcss-nested': {},
        'postcss-preset-env': {},
        cssnano: { preset: 'default' },
    }
})