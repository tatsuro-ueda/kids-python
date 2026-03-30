<!DOCTYPE html>
<html lang="{{lang}}" dir="{{dir}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{privacy.title}}</title>
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="{{cssPath}}">
</head>
<body>
  <section class="hero" style="padding: 30px 20px;">
    <a href="{{homeUrl}}" style="text-decoration: none;">
      <img src="{{assetsPath}}/snake.png" alt="{{lp.mascotAlt}}" class="hero-mascot" style="width: 60px;">
      <h1>{{lp.heroTitle}}</h1>
    </a>
  </section>

  <section class="safety">
    <h2>{{privacy.heading}}</h2>
    <dl class="safety-list">
      <dt>{{privacy.dataTitle}}</dt>
      <dd>{{privacy.dataDesc}}</dd>

      <dt>{{privacy.storageTitle}}</dt>
      <dd>{{privacy.storageDesc}}
        <ul style="margin-top: 8px; padding-inline-start: 20px;">
          <li>{{privacy.storageItem1}}</li>
          <li>{{privacy.storageItem2}}</li>
          <li>{{privacy.storageItem3}}</li>
        </ul>
      </dd>

      <dt>{{privacy.cookieTitle}}</dt>
      <dd>{{privacy.cookieDesc}}</dd>

      <dt>{{privacy.analyticsTitle}}</dt>
      <dd>{{privacy.analyticsDesc}}</dd>

      <dt>{{privacy.contactTitle}}</dt>
      <dd>{{privacy.contactDesc}}</dd>
    </dl>
  </section>

  <footer class="site-footer">
    <p>{{lp.footerOperator}} <a href="https://feel-physics.jp" target="_blank" rel="noopener">Feel Physics</a></p>
    <p><a href="mailto:tatsuro.ueda@feel-physics.jp">{{lp.footerContact}}</a> ｜ <a href="{{privacyUrl}}">{{lp.footerPrivacy}}</a></p>
    <p>&copy; 2026 Feel Physics</p>
  </footer>
</body>
</html>
