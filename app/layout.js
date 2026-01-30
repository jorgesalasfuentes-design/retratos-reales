import './globals.css'

export const metadata = {
  title: 'Retratos Reales - AI Pet Portraits',
  description: 'Transform your pet photos into stunning AI-generated artwork',
  manifest: '/manifest.json',
  themeColor: '#302b63',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Retratos Reales',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  )
}
