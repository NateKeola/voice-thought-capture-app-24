
// This file now re-exports from our refactored modules to maintain backward compatibility
import {
  saveMemo,
  getAllMemos,
  getMemoById,
  updateMemo,
  deleteMemo
} from './memos/memoService';

export {
  saveMemo,
  getAllMemos,
  getMemoById,
  updateMemo,
  deleteMemo
};
