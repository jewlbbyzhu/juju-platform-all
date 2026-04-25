export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '聚聚',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: '聚聚是一个社交聚会平台，帮助你发现身边的精彩活动，结识志同道合的朋友，创造美好回忆',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@juju.com'
    }
  }

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '聚聚',
    url: baseUrl,
    description: '发现精彩聚会，结识志同道合的朋友',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/help?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  )
}
