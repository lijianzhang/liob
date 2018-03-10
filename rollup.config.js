import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        file: 'lib/index.js',
        format: 'cjs',
    },
    plugins: [resolve({
    // 将自定义选项传递给解析插件
        customResolveOptions: {
            moduleDirectory: 'node_modules',
        },
    }), babel({
        runtimeHelpers: true,
    }),
    commonjs({
        include: 'node_modules/**',
    }),
    ],
    // 指出应将哪些模块视为外部模块
    external: ['react', 'react-dom'],
};
