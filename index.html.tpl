<!DOCTYPE html>
<html lang="{{lang}}" dir="{{dir}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{lp.title}}</title>
  <meta name="description" content="{{lp.description}}">
  <link rel="canonical" href="{{canonicalUrl}}">
  <meta property="og:title" content="{{lp.ogTitle}}">
  <meta property="og:description" content="{{lp.ogDescription}}">
  <meta property="og:image" content="/assets/ogp.png">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  {{hreflangLinks}}
  <link rel="stylesheet" href="{{cssPath}}">
  <script type="application/ld+json">
  {{jsonLd}}
  </script>
</head>
<body>
  <section class="hero">
    <h1>{{lp.heroTitle}}</h1>
    <p class="hero-catch">{{lp.heroCatch}}</p>
    <p class="hero-sub">{{lp.heroSub}}</p>
    <a href="{{appUrl}}" class="cta-btn">{{lp.ctaButton}}</a>
    <div class="hero-screenshot-wrapper">
      <img src="{{screenshotPath}}/step-run.png" alt="{{lp.screenshotAlt}}" class="hero-screenshot">
      <img src="{{assetsPath}}/snake.png" alt="{{lp.mascotAlt}}" class="hero-mascot">
    </div>
  </section>
  <div class="hero-wave">
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
      <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#e8f4fc"/>
    </svg>
  </div>

  <section class="problems fade-in">
    <h2>{{lp.problemsTitle}}</h2>
    <ul class="problem-list">
      <li>{{lp.problem1}}</li>
      <li>{{lp.problem2}}</li>
      <li>{{lp.problem3}}</li>
      <li>{{lp.problem4}}</li>
    </ul>
  </section>

  <section class="features fade-in">
    <h2>{{lp.featuresTitle}}</h2>
    <div class="feature-grid">
      <div class="feature-card feature-card--blue">
        <span class="feature-icon">🌐</span>
        <h3>{{lp.feature1Title}}</h3>
        <p>{{lp.feature1Desc}}</p>
      </div>
      <div class="feature-card feature-card--green">
        <span class="feature-icon">✏️</span>
        <h3>{{lp.feature2Title}}</h3>
        <p>{{lp.feature2Desc}}</p>
      </div>
      <div class="feature-card feature-card--pink">
        <span class="feature-icon">💬</span>
        <h3>{{lp.feature3Title}}</h3>
        <p>{{lp.feature3Desc}}</p>
      </div>
      <div class="feature-card feature-card--yellow">
        <span class="feature-icon">💾</span>
        <h3>{{lp.feature4Title}}</h3>
        <p>{{lp.feature4Desc}}</p>
      </div>
    </div>
  </section>

  <section class="error-demo">
    <h2>{{lp.errorDemoTitle}}</h2>
    <p class="error-demo-intro">{{lp.errorDemoIntro}}</p>
    <div class="error-demo-list">
      <div class="error-demo-item">
        <div class="error-before">
          <span class="error-label">{{lp.errorLabelBefore}}</span>
          <code>SyntaxError: '(' was never closed</code>
        </div>
        <div class="error-arrow">↓</div>
        <div class="error-after">
          <span class="error-label">{{lp.errorLabelAfter}}</span>
          <code>{{lp.errorTranslated1}}</code>
        </div>
      </div>
      <div class="error-demo-item">
        <div class="error-before">
          <span class="error-label">{{lp.errorLabelBefore}}</span>
          <code>NameError: name 'hensuu' is not defined</code>
        </div>
        <div class="error-arrow">↓</div>
        <div class="error-after">
          <span class="error-label">{{lp.errorLabelAfter}}</span>
          <code>{{lp.errorTranslated2}}</code>
        </div>
      </div>
      <div class="error-demo-item">
        <div class="error-before">
          <span class="error-label">{{lp.errorLabelBefore}}</span>
          <code>IndentationError: expected an indented block</code>
        </div>
        <div class="error-arrow">↓</div>
        <div class="error-after">
          <span class="error-label">{{lp.errorLabelAfter}}</span>
          <code>{{lp.errorTranslated3}}</code>
        </div>
      </div>
    </div>
    <p class="error-demo-note">{{lp.errorDemoNote}}</p>
  </section>

  <section class="scratch-story">
    <h2>{{lp.scratchTitle}}</h2>
    <div class="story-content">
      <p>{{lp.scratchP1}}</p>
      <p>{{lp.scratchP2}}</p>
      <p>{{lp.scratchP3}}</p>
      <p>{{lp.scratchP4}}</p>
      <a href="{{appUrl}}" class="cta-btn">{{lp.scratchCta}}</a>
    </div>
  </section>

  <section class="examples fade-in">
    <h2>{{lp.examplesTitle}}</h2>
    <div class="example-grid">
      <div class="example-card">
        <h3>{{lp.example1Title}}</h3>
        <pre class="example-code" dir="ltr">{{lp.example1Code}}</pre>
        <div class="example-result" dir="ltr">{{lp.example1Result}}</div>
      </div>
      <div class="example-card">
        <h3>{{lp.example2Title}}</h3>
        <pre class="example-code" dir="ltr">{{lp.example2Code}}</pre>
        <div class="example-result" dir="ltr">{{lp.example2Result}}</div>
      </div>
      <div class="example-card">
        <h3>{{lp.example3Title}}</h3>
        <pre class="example-code" dir="ltr">{{lp.example3Code}}</pre>
        <div class="example-result" dir="ltr">{{lp.example3Result}}</div>
      </div>
    </div>
  </section>

  <section class="safety fade-in">
    <h2>{{lp.safetyTitle}}</h2>
    <dl class="safety-list">
      <dt>{{lp.safety1Title}}</dt>
      <dd>{{lp.safety1Desc}}</dd>
      <dt>{{lp.safety2Title}}</dt>
      <dd>{{lp.safety2Desc}}</dd>
      <dt>{{lp.safety3Title}}</dt>
      <dd>{{lp.safety3Desc}}</dd>
      <dt>{{lp.safety4Title}}</dt>
      <dd>{{lp.safety4Desc}}</dd>
    </dl>
  </section>

  <section class="howto fade-in">
    <h2>{{lp.howtoTitle}}</h2>
    <div class="steps">
      <div class="step">
        <span class="step-number">1</span>
        <h3>{{lp.step1Title}}</h3>
        <img src="{{screenshotPath}}/step-open.png" alt="{{lp.step1Alt}}">
        <p>{{lp.step1Desc}}</p>
      </div>
      <div class="step">
        <span class="step-number">2</span>
        <h3>{{lp.step2Title}}</h3>
        <img src="{{screenshotPath}}/step-write.png" alt="{{lp.step2Alt}}">
        <p>{{lp.step2Desc}}</p>
      </div>
      <div class="step">
        <span class="step-number">3</span>
        <h3>{{lp.step3Title}}</h3>
        <img src="{{screenshotPath}}/step-run.png" alt="{{lp.step3Alt}}">
        <p>{{lp.step3Desc}}</p>
      </div>
    </div>
  </section>

  <section class="cta-section fade-in">
    <a href="{{appUrl}}" class="cta-btn cta-btn-large">{{lp.ctaLarge}}</a>
    <p class="cta-note">{{lp.ctaNote}}</p>
    <div class="share-section">
      <p class="share-label">{{lp.shareLabel}}</p>
      <div class="share-links" id="lp-share-links"></div>
    </div>
  </section>
  <script>
    var SHARE_TEXT = "{{lp.shareText}}";
    var url = encodeURIComponent(location.href.split("#")[0]);
    var text = encodeURIComponent(SHARE_TEXT);
    document.getElementById("lp-share-links").innerHTML =
      '<a class="share-btn share-line" href="https://social-plugins.line.me/lineit/share?url=' + url + '" target="_blank" rel="noopener">LINE</a>' +
      '<a class="share-btn share-x" href="https://twitter.com/intent/tweet?url=' + url + '&text=' + text + '" target="_blank" rel="noopener">X</a>' +
      '<a class="share-btn share-fb" href="https://www.facebook.com/sharer/sharer.php?u=' + url + '" target="_blank" rel="noopener">Facebook</a>';
  </script>
  <script>
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  </script>
  <footer class="site-footer">
    <p>{{lp.footerOperator}} <a href="https://feel-physics.jp" target="_blank" rel="noopener">Feel Physics</a></p>
    <p><a href="mailto:tatsuro.ueda@feel-physics.jp">{{lp.footerContact}}</a> ｜ <a href="{{privacyUrl}}">{{lp.footerPrivacy}}</a></p>
    <p>&copy; 2026 Feel Physics</p>
  </footer>
</body>
</html>
