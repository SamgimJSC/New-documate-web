import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'AI 자동 분류',
    description: '계약서, 보증서, 처방전, 영수증을 AI가 자동으로 구분합니다.',
  },
  {
    title: '디지털 캐비닛',
    description: '흩어진 종이 문서를 안전하게 보관하고 빠르게 검색합니다.',
  },
  {
    title: '기한 알림',
    description: '계약 만료일, 보증기간, 갱신일을 놓치지 않도록 알려줍니다.',
  },
  {
    title: '소비 리포트',
    description: '영수증 데이터를 기반으로 월별 지출과 소비 패턴을 확인합니다.',
  },
];

const documentCards = [
  { label: '계약서', text: '만료일 · 갱신일 추출' },
  { label: '보증서', text: '구매일 · 보증기간 정리' },
  { label: '처방전', text: '진료일 · 약품명 분석' },
  { label: '영수증', text: '날짜 · 가게명 · 금액 분리' },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <span>D</span>
          DocuMate
        </Link>

        <nav className="landing-nav">
          <a href="#service">서비스</a>
          <a href="#features">기능</a>
          <a href="#plans">요금제</a>
          <a href="#contact">고객센터</a>
        </nav>

        <div className="landing-actions">
          <Link to="/login" className="landing-login">로그인</Link>
          <Link to="/signup" className="landing-primary small">무료로 시작하기</Link>
        </div>
      </header>

      <section id="service" className="landing-hero">
        <div className="hero-copy">
          <span className="hero-badge">AI Document Assistant</span>
          <h1>
            종이 서류를,<br />
            AI가 스마트하게 정리합니다.
          </h1>
          <p>
            계약서, 보증서, 처방전, 영수증까지 사진으로 올리면 AI가 문서 종류를 분석하고
            핵심 정보를 정리해주는 지능형 문서 관리 플랫폼입니다.
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="landing-primary">무료로 시작하기</Link>
            <a href="#how" className="landing-secondary">서비스 보기</a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>10,000+</strong>
              <span>문서 정리</span>
            </div>
            <div>
              <strong>5,900원</strong>
              <span>Pro 월 요금</span>
            </div>
            <div>
              <strong>99.9%</strong>
              <span>안전한 보관</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="DocuMate 서비스 미리보기">
          <div className="visual-flow">
            <div className="visual-icon">📷</div>
            <span>→</span>
            <div className="visual-icon green">AI</div>
          </div>

          <div className="visual-grid">
            {documentCards.map((card) => (
              <article key={card.label}>
                <span>{card.label}</span>
                <strong>{card.text}</strong>
              </article>
            ))}
          </div>

          <div className="visual-alert">
            <span>⏰</span>
            <div>
              <strong>다가오는 만기 알림</strong>
              <p>임대차계약서 만료 6개월 전</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="landing-how">
        <span className="section-chip">HOW IT WORKS</span>
        <h2>업로드부터 보관까지 한 번에</h2>
        <div className="how-grid">
          <article>
            <span>01</span>
            <h3>이미지 업로드</h3>
            <p>JPG, PNG 이미지를 업로드하거나 모바일에서 카메라로 촬영합니다.</p>
          </article>
          <article>
            <span>02</span>
            <h3>AI 분석</h3>
            <p>OCR과 AI가 문서 종류와 날짜, 금액, 만료일 등 핵심 정보를 추출합니다.</p>
          </article>
          <article>
            <span>03</span>
            <h3>자동 분기</h3>
            <p>일반 문서는 디지털 캐비닛에, 영수증은 영수증 관리 페이지에 저장됩니다.</p>
          </article>
        </div>
      </section>

      <section id="features" className="landing-features">
        <div className="section-title">
          <span className="section-chip">FEATURES</span>
          <h2>문서 관리와 소비 분석을 하나로</h2>
          <p>DocuMate는 단순 파일 보관이 아니라, 문서의 의미를 분석하고 필요한 순간에 다시 꺼낼 수 있게 돕습니다.</p>
        </div>

        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="plans" className="landing-plans">
        <div className="section-title">
          <span className="section-chip">PLANS</span>
          <h2>필요에 맞게 선택하세요</h2>
        </div>

        <div className="plan-cards">
          <article>
            <h3>Free</h3>
            <strong>₩0</strong>
            <p>기본 문서 정리와 알림 기능을 사용할 수 있습니다.</p>
            <ul>
              <li>문서 업로드 / AI 자동 분류</li>
              <li>디지털 캐비닛 보관 / 검색</li>
              <li>기본 만료일 알림</li>
            </ul>
            <Link to="/signup" className="landing-secondary full">무료로 시작하기</Link>
          </article>

          <article className="pro">
            <span className="recommend">추천</span>
            <h3>Pro</h3>
            <strong>₩5,900 / 월</strong>
            <p>소비 리포트와 고급 문서 기능까지 사용할 수 있습니다.</p>
            <ul>
              <li>월별 소비 리포트 자동 생성</li>
              <li>AI 소비패턴 분석</li>
              <li>이미지 마스킹 / PDF 병합 다운로드</li>
            </ul>
            <Link to="/signup" className="landing-primary full">Pro 플랜 시작하기</Link>
          </article>
        </div>
      </section>

      <section id="contact" className="landing-cta">
        <h2>종이 서류 관리, 이제 DocuMate로 시작하세요.</h2>
        <p>문서는 디지털 캐비닛에, 영수증은 소비 리포트에. 흩어진 기록을 한 곳에서 관리할 수 있습니다.</p>
        <div>
          <Link to="/signup" className="landing-primary">무료로 시작하기</Link>
          <Link to="/login" className="landing-secondary">로그인</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <strong>DocuMate</strong>
        <span>이용약관 · 개인정보처리방침 · 고객센터</span>
      </footer>
    </main>
  );
}
