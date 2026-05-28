const fs = require("fs");
const Module = require("module");
const path = require("path");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..", "..");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveWithAlias(request, parent, isMain, options) {
  if (request === "next/headers") {
    return path.join(projectRoot, "tests", "helpers", "next-headers-mock.cjs");
  }
  if (request === "@/lib/supabase/server") {
    return path.join(projectRoot, "tests", "helpers", "supabase-server-mock.cjs");
  }
  if (request.startsWith("@/")) {
    const mapped = path.join(projectRoot, "src", request.slice(2));
    const resolved = fs.existsSync(mapped) ? mapped : `${mapped}.ts`;
    return originalResolveFilename.call(this, resolved, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

Module._extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: filename,
  });

  module._compile(transpiled.outputText, filename);
};
