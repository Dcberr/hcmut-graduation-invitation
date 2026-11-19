export const parkingPlaces = [
 { id:'gate-1', title:'Cổng 1', subtitle:'Trường Đại học Bách khoa', kind:'gate', query:'Cổng 1 Đại học Bách khoa 268 Lý Thường Kiệt Thành phố Hồ Chí Minh', note:'Đến cổng 1 và hỏi bảo vệ lối vào bãi gửi xe trong trường.' },
 { id:'gate-3', title:'Cổng 3', subtitle:'Trường Đại học Bách khoa', kind:'gate', query:'Cổng 3 Đại học Bách khoa Tô Hiến Thành Thành phố Hồ Chí Minh', note:'Đến cổng 3 và theo hướng dẫn của bảo vệ để gửi xe.' },
 { id:'hospital', title:'Bệnh viện Trưng Vương', subtitle:'Địa điểm ngoài trường', kind:'hospital', query:'Bệnh viện Trưng Vương 266 Lý Thường Kiệt Thành phố Hồ Chí Minh', note:'Hỏi nhân viên bãi xe về việc nhận xe khách ngoài bệnh viện và giờ lấy xe, sau đó di chuyển đến trường.' },
 { id:'stadium', title:'Nhà thi đấu Phú Thọ', subtitle:'Địa điểm ngoài trường', kind:'stadium', query:'Nhà thi đấu Phú Thọ Thành phố Hồ Chí Minh', note:'Hỏi nhân viên địa điểm về khu vực nhận gửi xe và giờ lấy xe, sau đó di chuyển đến trường.' },
] as const;
export function parkingMapUrl(query:string, embed=false) {
 return embed ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
