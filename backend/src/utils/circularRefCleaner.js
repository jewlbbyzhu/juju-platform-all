function cleanCircularRefs(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (seen.has(obj)) {
    return '[Circular]';
  }

  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => cleanCircularRefs(item, seen));
  }

  // 处理 Date 对象
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  const cleaned = {};
  for (const key in obj) {
    if (key === 'parent' || key === '_previousDataValues' || key === '_changed' || key === '_modelOptions') {
      continue;
    }
    cleaned[key] = cleanCircularRefs(obj[key], seen);
  }

  return cleaned;
}

function toJSONSafe(model) {
  if (!model) return null;
  
  // 处理 Date 对象
  if (model instanceof Date) {
    return model.toISOString();
  }
  
  if (typeof model.toJSON === 'function') {
    const plain = model.toJSON();
    return cleanCircularRefs(plain);
  }
  
  return cleanCircularRefs(model);
}

module.exports = {
  cleanCircularRefs,
  toJSONSafe
};
