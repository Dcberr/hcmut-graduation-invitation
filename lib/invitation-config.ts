/** Sửa nội dung tại đây; không cần thay component hoặc animation. */
export const invitation = {
  graduateName: 'Nguyễn Ngọc Chiến Công', guestName: 'Bạn',
  faculty: 'Khoa Khoa học và Kỹ thuật Máy tính', year: '2026',
  ceremonyDate: '28.11.2026', ceremonyTime: '12:30 - 14:00',
  ceremonyNote: 'Đợt lễ 28/11/2026',
  venue: 'Hội trường A5', school: 'Trường Đại học Bách khoa',
  university: 'Đại học Quốc gia Thành phố Hồ Chí Minh',
  phone: '0859217168',
  portraitUrl: 'portrait01.jpg', // Thêm public/portrait.jpg rồi đặt '/portrait.jpg'.
  mapUrl: '', // URL chia sẻ vị trí chính xác.
  mapEmbedUrl: '', // URL nhúng bản đồ, tuỳ chọn.
};
export function getMapUrl() {
  return invitation.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${invitation.venue}, ${invitation.school}, Thành phố Hồ Chí Minh`)}`;
}
