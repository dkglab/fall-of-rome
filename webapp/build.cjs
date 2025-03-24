const { build, context } = require("esbuild")

const options = {
  bundle: true,
  entryPoints: ["src/long-list.ts", "src/map-view.ts"],
  outdir: "build",
  platform: "browser",
  sourcemap: true,
  target: ["esnext"],
}

build(options).catch(() => process.exit(1))
