// Modify the webapp/build.ts file
import * as esbuild from "esbuild"

// Build the configuration
const buildOptions: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  splitting: false,
  sourcemap: true,
  target: "es2020",
  loader: {
    ".rq": "text", // Process SPARQL query files
  },
}

// Process command line arguments
const watch = process.argv.includes("--watch")

// Put await inside an asynchronous function rather than in the top-level scope
async function run() {
  try {
    if (watch) {
      // Development watch mode
      const ctx = await esbuild.context(buildOptions)
      await ctx.watch()
      console.log("Monitoring file changes...")
    } else {
      // Production construction
      await esbuild.build(buildOptions)
      console.log("Construction completed！")
    }
  } catch (error) {
    console.error("Build failure:", error)
    process.exit(1)
  }
}

// Executive function
run()