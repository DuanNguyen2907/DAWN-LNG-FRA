// Lớp bọc lưu trữ tiến trình học - giao tiếp với main process qua window.api
window.Store = (function () {
  const CACHE = {};

  async function get(key, fallback) {
    if (CACHE[key] !== undefined) return CACHE[key];
    const value = await window.api.storeGet(key);
    CACHE[key] = value === undefined || value === null ? fallback : value;
    return CACHE[key];
  }

  async function set(key, value) {
    CACHE[key] = value;
    return window.api.storeSet(key, value);
  }

  async function merge(key, partialObj) {
    const current = (await get(key, {})) || {};
    const updated = { ...current, ...partialObj };
    CACHE[key] = updated;
    return window.api.storeMerge(key, partialObj);
  }

  // Merge sâu 1 cấp: dùng khi `key` trỏ tới một object có nhiều mục con theo id
  // (vd: vocabEnrichment[wordId] = {...}) và ta chỉ muốn cập nhật vài field của
  // mục con đó mà không làm mất các field khác đã lưu trước đây.
  async function mergeNested(key, id, partialObj) {
    const current = (await get(key, {})) || {};
    const existingItem = current[id] || {};
    const updatedItem = { ...existingItem, ...partialObj };
    const updated = { ...current, [id]: updatedItem };
    CACHE[key] = updated;
    return window.api.storeSet(key, updated);
  }

  return { get, set, merge, mergeNested };
})();
