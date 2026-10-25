// Load the project's TypeScript and Vue SFCs with the installed Vue compiler.
// This keeps the regression suite dependency-free and separate from production.
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { compileScript, parse } from 'vue/compiler-sfc';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('quasar/lang/') && !specifier.endsWith('.js'))
      return nextResolve(`${specifier}.js`, context);
    if (specifier === '#q-app') {
      return {
        url: 'data:text/javascript,export const defineBoot = (boot) => boot;',
        shortCircuit: true,
      };
    }
    let url;
    if (specifier.startsWith('@/')) url = pathToFileURL(resolve(sourceRoot, specifier.slice(2)));
    else if (specifier.startsWith('.') && context.parentURL?.startsWith('file:'))
      url = new URL(specifier, context.parentURL);
    if (url) {
      const path = fileURLToPath(url);
      if (path.startsWith(sourceRoot)) {
        for (const candidate of [
          path,
          `${path}.ts`,
          `${path}/index.ts`,
          path.replace(/\.js$/, '.ts'),
        ]) {
          if (existsSync(candidate) && statSync(candidate).isFile()) {
            return { url: pathToFileURL(candidate).href, shortCircuit: true };
          }
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(sourceRoot).href) && /\.(ts|vue)$/.test(url)) {
      let source = readFileSync(new URL(url), 'utf8');
      if (url.endsWith('.vue')) {
        const { descriptor } = parse(source, { filename: fileURLToPath(url) });
        source = compileScript(descriptor, { id: url, inlineTemplate: true }).content;
      }
      return { format: 'module', source: stripTypeScriptTypes(source), shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
