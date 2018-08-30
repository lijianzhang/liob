import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'typescript';
// import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import rollupTypescript from 'rollup-plugin-typescript';

const env = process.env.NODE_ENV;

const config = {
    input: 'src/index.ts',
    external: ['react'],
    output: {
        format: 'umd',
        name: 'liob',
        globals: {
            react: 'React',
        },
    },
    plugins: [
        nodeResolve(),
        // babel({
        //     exclude: '**/node_modules/**',
        // }),
        rollupTypescript({ typescript, importHelpers: true }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
        commonjs(),
    ],
};

if (env === 'production') {
    config.plugins.push(uglify({
        compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
        },
    }));
}


export default config;
