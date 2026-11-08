/**
 * remark-double-equals-bold
 *
 * 让 `==文本==` 渲染为加粗（<strong>）。
 *
 * 背景：Astro 默认只启用 GFM（remark-gfm），GFM 中没有 `==` 语法，
 * 因此 `==文本==` 会被当作普通字符原样输出。
 *
 * 实现：在 mdast 阶段遍历 text 节点，把 `==...==` 切分成
 * text + strong + text 的节点序列，后续由 remark-rehype 转成 <strong>。
 * 代码块（code）、行内代码（inlineCode）中的内容不会被处理。
 */

const PATTERN = /==([^=\n]+?)==/g

/** 递归遍历节点树 */
function walk(node, cb) {
  if (!Array.isArray(node.children)) return

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const replaced = cb(child, i, node)
    if (typeof replaced === 'number') i = replaced - 1
    else walk(child, cb)
  }
}

export default function remarkDoubleEqualsBold() {
  return tree => {
    walk(tree, (node, index, parent) => {
      if (node.type !== 'text' || !node.value.includes('==')) return

      PATTERN.lastIndex = 0
      const parts = []
      let last = 0
      let match

      while ((match = PATTERN.exec(node.value)) !== null) {
        if (match.index > last) {
          parts.push({ type: 'text', value: node.value.slice(last, match.index) })
        }
        parts.push({
          type: 'strong',
          children: [{ type: 'text', value: match[1] }],
        })
        last = match.index + match[0].length
      }

      // 没有匹配到成对的 ==，保持原样
      if (parts.length === 0) return

      if (last < node.value.length) {
        parts.push({ type: 'text', value: node.value.slice(last) })
      }

      parent.children.splice(index, 1, ...parts)
      // 跳过刚插入的节点，避免重复处理
      return index + parts.length
    })
  }
}
