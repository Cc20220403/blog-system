import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description?: string
  url?: string
  type?: 'website' | 'article'
}

function SEOHead({ title, description, url, type = 'website' }: SEOHeadProps) {
  const siteName = '个人博客'
  const fullTitle = `${title} - ${siteName}`
  const desc = description || '一个分享技术与生活的个人博客'
  const pageUrl = url ? `${window.location.origin}${url}` : window.location.href

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="zh_CN" />
    </Helmet>
  )
}

export default SEOHead
