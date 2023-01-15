import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { defineConfig, UserConfig } from 'vite'

export default defineConfig(({ mode }) => {
    let config: UserConfig = {
        plugins: [
            wasm(),
            topLevelAwait(),
        ],
        worker: {
            plugins: [
                wasm(),
                topLevelAwait(),
            ],
            format: 'es',
        }
    };
    if (mode === 'production') {
        config.base = '/furthest-point-calculator/'
    }
    return config;
});
