// src/pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="fr">
        <Head>
          {/* Favicon et meta tags de base */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/images/icons/icon-192.png" />
          <meta name="theme-color" content="#ff8c00" />

          {/* Web App Manifest (PWA installability + SEO signal) */}
          <link rel="manifest" href="/manifest.json" />

          {/* Preload LCP image candidate (hero fallback) */}
          <link
            rel="preload"
            as="image"
            href="/images/hero/Slide4.png"
            type="image/png"
          />

          {/* Fonts Google preconnect (fonts are self-hosted via next/font, but keep for fallback) */}
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
            crossOrigin="anonymous"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </Head>
        
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;