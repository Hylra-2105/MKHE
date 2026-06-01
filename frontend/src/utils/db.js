import localforage from "localforage";

// Cấu hình kho lưu trữ nháp
export const draftDB = localforage.createInstance({
  name: "MKHE_App",
  storeName: "product_drafts",
});
