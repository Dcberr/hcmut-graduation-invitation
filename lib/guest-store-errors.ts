/** Safe diagnostics for authenticated administrators. Never return paths or names. */
export function guestStoreError(error: unknown) {
 const issue = error as { code?: string; name?: string; syscall?: string } | null;
 const code = typeof issue?.code === 'string' ? issue.code : issue?.name === 'SyntaxError' ? 'GUEST_DATA_INVALID' : 'GUEST_STORE_ERROR';
 const messages: Record<string, string> = {
  EACCES: 'Ứng dụng không có quyền đọc/ghi thư mục dữ liệu. Hãy kiểm tra quyền của Docker volume hoặc GUEST_DATA_DIR.',
  EPERM: 'Runtime không cho phép ghi dữ liệu. Hãy chạy bằng Next.js Node và kiểm tra quyền thư mục dữ liệu.',
  EROFS: 'Thư mục dữ liệu đang chỉ đọc. Hãy gắn Docker volume có quyền ghi.',
  ENOSPC: 'Ổ đĩa lưu dữ liệu đã đầy. Hãy kiểm tra dung lượng và inode trên server.',
  EDQUOT: 'Dung lượng lưu trữ đã vượt hạn mức.',
  ENOENT: 'Không tạo được file dữ liệu. Kiểm tra GUEST_DATA_DIR và dùng runtime Node thay cho Cloudflare/Vinext.',
  ENOTDIR: 'Đường dẫn dữ liệu không phải thư mục. Hãy kiểm tra GUEST_DATA_DIR.',
  ENOSYS: 'Runtime hiện tại không hỗ trợ lưu file. Chạy npm run dev bằng Node hoặc dùng image Next.js standalone.',
  ERR_METHOD_NOT_IMPLEMENTED: 'Runtime hiện tại không hỗ trợ lưu file. Hãy dùng Next.js Node.',
  GUEST_DATA_INVALID: 'File dữ liệu khách bị lỗi định dạng. Hãy khôi phục từ backup; ứng dụng không ghi đè file này.',
  GUEST_LIMIT: 'Đã đạt giới hạn 5.000 khách mời.',
 };
 return { code, error: messages[code] || 'Không lưu hoặc đọc được khách mời. Xem log server với mã GUEST_STORE_ERROR.', status: code === 'GUEST_LIMIT' ? 409 : 500 };
}
