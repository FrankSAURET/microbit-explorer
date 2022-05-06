"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
async function run() {
    await fs_extra_1.default.writeFile('dist/extension.d.ts', 'export * from \'./src/extension\'');
}
run();
//# sourceMappingURL=post-build.js.map