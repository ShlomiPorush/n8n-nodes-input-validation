import { execSync } from 'child_process';
import { cpSync, mkdirSync, readdirSync, statSync } from 'fs';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));

execSync('tsc', { cwd: root, stdio: 'inherit' });

function copyAssets(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			copyAssets(full);
			continue;
		}
		const ext = extname(entry);
		if (ext === '.svg' || entry.endsWith('.node.json')) {
			const rel = full.slice(root.length + 1);
			const dest = join(root, 'dist', rel);
			mkdirSync(dirname(dest), { recursive: true });
			cpSync(full, dest);
		}
	}
}

copyAssets(join(root, 'nodes'));
console.log('Build complete → dist/');
