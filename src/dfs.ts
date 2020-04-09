export default function* dfs(node: any, defaultDepth: number = 0): any {
    const children = (node instanceof Array) ? node : node.children;
    let depth = defaultDepth;
  
    for (const child of children) {
      yield [child, depth];
  
      if (child.children && child.children.length) {
        depth += 1
        yield* dfs(child.children, depth);
        depth -= 1;
      }
    }
  }
  