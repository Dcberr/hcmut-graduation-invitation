# Thiệp mời tốt nghiệp HCMUT

## Chạy thử

```sh
npm install
npm run dev
```

Mở địa chỉ localhost được in trong terminal. Build bằng `npm run build`.

## Cá nhân hóa

Sửa `lib/invitation-config.ts`: tên, khách mời, khoa, ảnh chân dung, ngày/giờ, điện thoại và đường dẫn Google Maps. Đặt ảnh trong `public` rồi dùng đường dẫn `/portrait.jpg`. Tham số URL `?guest=Anh%20Hoàng` thay tên khách mời.

Logo chính thức do người dùng cung cấp: `public/assets/bk-official.png`. File `bk-official.svg` nhúng nguyên ảnh và giới hạn vùng hiển thị để bỏ khoảng trống quanh logo. Font hiện tải từ Google Fonts; có font hệ thống dự phòng.

## Chuyển động

Bì thư mở bằng một timeline Web Animations 3 giây trong `components/invitation/useEnvelopeOpening.ts`: dấu niêm phong nhấc lên, nắp xoay mở, thiệp trượt ra trong khi bì thư hạ xuống rồi xoay trọn 360 độ quanh trục dọc Y đồng thời lớn dần về vị trí đọc. Các chuyển động chồng nhịp, không nối bằng timer giữa các lần render. Desktop dùng hai tờ giấy có mặt trước/sau xoay 3D; điện thoại hiển thị từng trang với chuyển động trượt để dễ đọc. Chặn điều hướng khi chuyển động chưa kết thúc. Có hỗ trợ phím mũi tên và thiết lập giảm chuyển động của hệ điều hành.

Popup bản đồ mở kết quả tìm kiếm khi chưa cung cấp URL vị trí chính xác. Các thông tin cá nhân còn thiếu được giữ ở dạng chờ cập nhật.

### Điện thoại

Thiệp căn theo chiều rộng, cho phép cuộn dọc trên màn hình thấp. Hiển thị từng trang; vuốt ngang ít nhất 55px hoặc dùng nút 44px để chuyển. Vuốt dọc giữ hành vi cuộn. Nắp/thân bì thư dùng chung điểm co giãn. Popup chỉ đường có chiều cao giới hạn và cuộn riêng.

## Tạo thiệp cho nhiều khách mời

Mở `/tao-thiep`, nhập khóa quản trị và tên khách (mỗi dòng một tên), chọn
**Lưu và lấy link**. Mỗi khách có link `/invitation/<mã-ngẫu-nhiên>`; cùng tên đã chuẩn hóa
sẽ dùng lại mã cũ. Chọn **Xem khách đã lưu** để lấy lại danh sách sau khi refresh.
Link cũ `/moi/<mã>` tự chuyển hướng sang `/invitation/<mã>` và giữ nguyên mã khách.
Tên khách không còn nằm trong URL. Các link cũ `?guest=...` vẫn dùng được.

Danh sách được tra cứu trong RAM và ghi snapshot JSON nguyên tử vào `data/guests.json`.
Đây là kho dữ liệu nhỏ cho **một tiến trình / một container**, không phải database
phân tán: không scale nhiều replica cùng ghi file. Giới hạn 5.000 khách.
File lỗi sẽ báo lỗi thay vì tự xóa/ghi đè. Docker volume `guest-data` giữ dữ liệu
qua restart và cập nhật image; không chạy `docker compose down -v` nếu muốn giữ link.
Giữ nguyên tên Compose project khi triển khai để dùng đúng volume cũ.

Cấu hình trên server trong `.env.production`:

```sh
openssl rand -hex 32
# Dán chuỗi vừa tạo vào INVITATION_ADMIN_TOKEN trong .env.production.
# Không đưa khóa này vào Git hoặc gửi cho khách.
```

Sau khi cập nhật image và Compose:

```sh
docker compose --env-file .env.production -f compose.production.yaml pull
docker compose --env-file .env.production -f compose.production.yaml up -d --no-build
```

API tạo và liệt kê khách yêu cầu khóa quản trị tối thiểu 24 ký tự. Không có khóa
thì API quản trị bị vô hiệu hóa; người có link cũ vẫn xem thiệp được.
Khóa chỉ ở bộ nhớ trang quản trị, không được lưu localStorage hay đưa vào URL.
Mã link không phải mật khẩu: bất kỳ ai có link đều xem được tên khách tương ứng.
Mã sai trả trang không tìm thấy, không tự hiện tên mặc định. Trang theo mã không cache
chung và không được lập chỉ mục tìm kiếm.

Chạy local chức năng lưu khách bằng Node: đặt `INVITATION_ADMIN_TOKEN` trong
`.env.local`, chạy `npm run dev` (dừng dev cũ dùng cổng 5173 trước).
Luồng Vinext/Cloudflare dev cũ không hỗ trợ kho file Node này.

Backup: sao chép `/app/data/guests.json` từ container, ví dụ
`docker cp <container-name>:/app/data/guests.json ./guests-backup.json`.
Giữ backup riêng tư vì chứa tên khách. Khi khôi phục, dừng app, chép lại vào đúng
volume và đảm bảo user Node (UID 1000) có quyền đọc/ghi trước khi bật app.

Kiểm tra: `node --experimental-strip-types tests/guest-store.mjs`.

### Mở bằng dây niêm phong

Giữ vòng dây vàng và kéo xuống 64 pixel màn hình, thả khi vòng hiện dấu kiểm để mở. Thả sớm hoặc hủy cử chỉ sẽ trả dây về chỗ cũ. Có thể Tab tới vòng dây rồi dùng Enter/Space. Nút dừng chuyển động nền vẫn hoạt động, chế độ giảm chuyển động giữ nền tĩnh.

### Dây kéo tương tác 2D và cảm biến

Dây xoay quanh điểm gắn và thay đổi độ dài theo hướng kéo. Kéo đủ 64px màn hình rồi thả sẽ mở; kéo chưa đủ sẽ bật về. Trên điện thoại, chọn **Bật nghiêng máy** để yêu cầu quyền cảm biến nếu trình duyệt cần. Cần HTTPS và trình duyệt hỗ trợ DeviceOrientation; có thể tắt bất cứ lúc nào. Kéo tay vẫn hoạt động khi cảm biến không khả dụng.

## Chạy bằng Docker Compose

Cần Docker Engine (hoặc Docker Desktop/Colima) đang chạy và Docker Compose v2.
Chạy các lệnh bên dưới trong thư mục `hcmut-invitation`:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f invitation
```

Mở **http://localhost:8080** trên máy chạy Docker. Cổng app chỉ bind vào
`127.0.0.1`, không truy cập trực tiếp bằng IP LAN hoặc IP public. Nginx chạy
trực tiếp trên Ubuntu proxy tới `http://127.0.0.1:8080`; điện thoại truy cập
qua tên miền HTTPS của Nginx. Đổi cổng localhost nếu cần:

```sh
APP_PORT=3000 docker compose up -d --build
```

Sau khi sửa nội dung, ảnh hoặc code, chạy lại `docker compose up -d --build`.
Source code không được mount vào container; phiên bản đang chạy là bản đã build.
Dừng app bằng `docker compose down`. Danh sách khách được giữ trong volume `guest-data`.

Image dùng Node 24 trên Debian, build nhiều giai đoạn và chạy bằng user `node`.
Docker dùng `npm run build:docker` (Next.js standalone) và `node server.js`.
Container không dùng Cloudflare, Wrangler, workerd hay Vite dev server.
Chỉ các file runtime cần thiết, static assets và thư mục public được đưa vào image cuối.
`npm run dev` chạy Next.js Node để hỗ trợ lưu khách trong file.
Healthcheck kiểm tra HTTP mỗi 30 giây; `restart: unless-stopped` khởi động lại
khi tiến trình thoát, không tự restart chỉ vì healthcheck báo unhealthy.

Nếu chia sẻ qua Internet, đặt reverse proxy HTTPS hoặc tunnel trỏ tới cổng 8080.
Tính năng nghiêng máy cần HTTPS và quyền cảm biến của trình duyệt; thao tác kéo
bằng tay vẫn dùng được qua HTTP. Ví dụ tunnel đang trỏ cổng 5173 cần đổi sang 8080.
Không cần tài khoản hoặc token dịch vụ bên ngoài để chạy container.

## Droplet 512 MB: build bằng GitHub Actions, server chỉ pull

Dùng thư mục `hcmut-invitation` làm **gốc repository GitHub** (Dockerfile,
package.json và `.github` nằm ngay gốc). Workflow `.github/workflows/container.yml`
chạy khi push nhánh `main` hoặc chọn Actions → Build invitation image → Run workflow.
Workflow build `linux/amd64` đúng kiến trúc Droplet, chạy smoke test HTTP,
rồi push lên GHCR bằng `GITHUB_TOKEN` sẵn có. Không cần lưu SSH key server trong CI.
Workflow không tự triển khai hoặc thay đổi server.

Sau khi job thành công, lấy image đầy đủ trong Summary, dạng
`ghcr.io/owner/repo:sha-<full-commit-sha>`. Mỗi commit có tag riêng để rollback.
Nếu package private, đăng nhập GHCR trên server bằng tài khoản có quyền đọc package
và personal access token (classic) quyền `read:packages`:

```sh
docker login ghcr.io -u YOUR_GITHUB_USERNAME
```

Dán token tại prompt Password, không dùng mật khẩu GitHub. Không lưu token vào code.
Package public thì không cần đăng nhập để pull.

Trên server, đặt `compose.production.yaml` và `.env.production.example` vào cùng
thư mục deployment đang dùng. Không cần source code hoặc npm trên server:

```sh
cp .env.production.example .env.production
nano .env.production
# Thay INVITATION_IMAGE bằng image từ Summary của workflow.
docker compose --env-file .env.production -f compose.production.yaml pull
docker compose --env-file .env.production -f compose.production.yaml up -d --no-build
docker compose --env-file .env.production -f compose.production.yaml ps
curl -I http://127.0.0.1:8080/
docker stats --no-stream
```

Dùng cùng thư mục/tên Compose project với bản cũ để thay container hiện có;
không chạy hai project cùng bind cổng 8080. Nếu bản cũ dùng `-p`, dùng lại đúng `-p`.
Luôn chỉ rõ `-f compose.production.yaml`; không merge với `compose.yaml` có build.

Cập nhật: đổi INVITATION_IMAGE sang tag mới, chạy lại `pull` và `up -d --no-build`.
Rollback: đổi về tag commit trước, chạy lại hai lệnh đó. Có gián đoạn ngắn khi
thay container; đây không phải rolling deployment.

Bản production giới hạn container 320 MB và V8 old-space 192 MB để chừa tài nguyên
cho Ubuntu/Nginx trên Droplet 512 MB. Old-space không phải tổng RAM Node.js.
Đây là mức khởi đầu cần theo dõi; nếu container OOM/restart, cân nhắc tăng RAM
Droplet trước khi nới giới hạn. Build ở CI không giải quyết thiếu RAM lúc phục vụ.
Không chạy `up --build` hoặc `npm install` trên Droplet này.

Nếu build thủ công từ Mac Apple Silicon, phải dùng `docker buildx build
--platform linux/amd64 --tag <image> --push .` để tạo image chạy được trên Droplet.

### Nhạc nền

Nhạc nền “Vùng Ký Ức” từ file được cung cấp, lưu tại `public/audio/vung-ky-uc.mp3`.
Âm lượng nền 6%, tăng nhẹ trong 0,8 giây khi bắt đầu. File chỉ tải sau tương tác, không chặn giao diện ban đầu.
Bắt đầu sau thao tác mở thư hoặc nhấn nút nhạc; bật/tắt bằng nút loa. Lựa chọn tắt
được nhớ trên trình duyệt. Chuyển trang không khởi động lại nhạc; ẩn tab sẽ tạm dừng.
Đường dẫn nhạc và `backgroundVolume` được chỉnh trong `components/invitation/useInvitationMusic.ts`.
