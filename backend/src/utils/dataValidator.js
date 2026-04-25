function isEmpty(data) {
  if (data === null || data === undefined) return true;
  if (typeof data === 'string' && data.trim() === '') return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === 'object' && Object.keys(data).length === 0) return true;
  return false;
}

function validateResponseData(data) {
  if (isEmpty(data)) {
    throw new Error('响应数据为空');
  }
  return data;
}

module.exports = {
  isEmpty,
  validateResponseData
};
