export default function* dfs(node) {
  let children = (node instanceof Array) ? node : node.children;

  for (const child of children) {
    yield child;

    if (child.children && child.children.length) {
      yield* dfs(child.children);
    }
  }
}
