function parseChildren(context, ancestors) {
  const nodes = [];

  while (!isEnd(context, ancestors)) {
    const s = context.source;
    let node = null;

    // 优化插值解析
    if (s.startsWith('{{')) {
      try {
        // 增加健壮性检查
        const closingIndex = s.indexOf('}}');
        if (closingIndex === -1) {
          console.warn('未找到插值结束符');
          context.source = context.source.slice(2);
          continue;
        }
        node = parseInterpolation(context);
      } catch (error) {
        console.error('插值解析失败:', error);
        context.source = context.source.slice(2);
        continue;
      }
    }
    // 标签解析
    else if (s.startsWith('<')) {
      node = parseTagNode(context, ancestors);
    }

    // 兜底文本解析
    if (!node) {
      try {
        node = parseText(context);
      } catch (error) {
        console.error('文本解析失败:', error);
        context.source = context.source.slice(1);
        continue;
      }
    }

    // 安全收集解析结果
    if (node) {
      nodes.push(node);
    }
  }

  return nodes;
}

// 提取标签解析逻辑
function parseTagNode(context, ancestors) {
  const s = context.source;

  // 结束标签处理
  if (s[1] === '/') {
    const endTagMatch = s.match(/^<\/([a-z0-9]+)>/i);
    if (endTagMatch) {
      return parseTag(context, TagType.End);
    }
  }

  // 开始标签处理
  if (/[a-z]/i.test(s[1])) {
    try {
      return parseElement(context, ancestors);
    } catch (error) {
      console.error('标签解析失败:', error);
      context.source = context.source.slice(1);
      return null;
    }
  }

  return null;
}