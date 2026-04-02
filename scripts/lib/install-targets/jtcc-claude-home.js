const path = require('path');
const { createInstallTargetAdapter, createFlatRuleOperations, createManagedOperation } = require('./helpers');

function createJtccCommandOperations(adapter, moduleId, sourceRelativePath, input = {}) {
  const normalizedSourcePath = sourceRelativePath.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+$/, '');

  if (!normalizedSourcePath.startsWith('commands/')) {
    return [];
  }

  const fileName = path.basename(normalizedSourcePath);
  const commandName = fileName.replace('.md', '');

  // 创建带有 jtcc- 前缀的命令名（避免 Windows 冒号问题）
  const jtccCommandName = `${commandName}.md`;

  const targetCommandsDir = path.join(adapter.resolveRoot(input), 'commands', 'jtcc');
  const destinationPath = path.join(targetCommandsDir, jtccCommandName);

  return [createManagedOperation({
    moduleId,
    sourceRelativePath: normalizedSourcePath,
    destinationPath,
    strategy: 'jtcc-namespace-copy',
  })];
}

function planJtccOperations(input = {}, adapter) {
  const operations = [];

  if (Array.isArray(input.modules)) {
    for (const module of input.modules) {
      const paths = Array.isArray(module.paths) ? module.paths : [];
      for (const sourceRelativePath of paths) {
        const normalizedPath = sourceRelativePath.replace(/\\/g, '/');

        if (normalizedPath.startsWith('commands/')) {
          // 处理命令文件，放到 jtcc 命名空间
          operations.push(...createJtccCommandOperations(adapter, module.id, sourceRelativePath, input));
        } else if (normalizedPath.startsWith('rules/')) {
          // 处理规则文件，使用扁平化规则操作
          operations.push(...createFlatRuleOperations({
            moduleId: module.id,
            repoRoot: input.repoRoot,
            sourceRelativePath,
            destinationDir: path.join(adapter.resolveRoot(input), 'rules')
          }));
        } else {
          // 其他文件按原有逻辑处理
          operations.push(adapter.createScaffoldOperation(module.id, sourceRelativePath, input));
        }
      }
    }
  }

  return operations;
}

module.exports = createInstallTargetAdapter({
  id: 'jtcc-claude-home',
  target: 'claude',
  kind: 'home',
  rootSegments: ['.claude'],
  installStatePathSegments: ['jtcc', 'install-state.json'],
  nativeRootRelativePath: '.claude-plugin',
  planOperations: planJtccOperations,
});