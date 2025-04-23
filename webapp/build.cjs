const { build, context } = require("esbuild")

const options = {
  bundle: true,
  entryPoints: [
    "src/list-view.ts", 
    "src/map-view.ts", 
    "src/drawer.ts", 
    "src/query/create-query.ts",
    "src/query/handle-query.ts",
    "src/query/query.ts",
    "src/prefix/prefix-list.ts"
  ],
  loader: { ".rq": "text" },
  outdir: "build",
  platform: "browser",
  sourcemap: true,
  target: ["esnext"],
}

build(options).catch(() => process.exit(1))
