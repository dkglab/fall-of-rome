/// <reference types="node" />
import * as esbuild from "esbuild";

// 构建选项
const buildOptions: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  splitting: false,
  sourcemap: true,
  target: "es2020",
  loader: {
    ".rq": "text", // 处理 SPARQL 查询文件
  },
};

// 处理命令行参数
const watch = process.argv.includes("--watch");

// 由于顶层的 await 不被允许，将其放到一个异步函数里
async function run() {
  try {
    if (watch) {
      // 开发模式：watch
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log("Monitoring file changes...");
    } else {
      // 生产模式：一次性构建
      await esbuild.build(buildOptions);
      console.log("Construction completed!");
    }
  } catch (error) {
    console.error("Build failure:", error);
    process.exit(1);
  }
}

// 执行函数
run();
