/** Server-rendered entrance: fluid CSS sizing works before JavaScript arrives. */
export function InitialEnvelope() {
 return <section className="initial-invitation" aria-label="Thiệp mời tốt nghiệp đang chuẩn bị">
  <p className="initial-kicker">MỘT CỘT MỐC · MỘT LỜI MỜI</p>
  <h1>Một niềm vui đang chờ bạn.</h1>
  <div className="initial-envelope" aria-hidden="true"><div className="initial-flap"/><div className="initial-seal"><img src="/assets/bk-official.svg" alt="" width="76" height="84" fetchPriority="high"/></div><div className="initial-copy"><strong>THƯ MỜI</strong><span>LỄ TỐT NGHIỆP</span></div><div className="initial-gold-line"/></div>
  <p role="status" className="initial-status"><span/>Đang chuẩn bị mở thiệp…</p>
  <noscript>Bạn cần bật JavaScript để mở và lật thiệp.</noscript>
 </section>;
}
