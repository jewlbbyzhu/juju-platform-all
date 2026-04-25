import HelpDetailClient from './HelpDetailClient'

// 静态导出需要的预定义参数
export function generateStaticParams() {
  return [
    { id: 'getting-started' },
    { id: 'account' },
    { id: 'payment' },
    { id: 'privacy' },
    { id: 'terms' },
    { id: 'safety' },
    { id: 'refund' },
    { id: 'contact' },
    { id: 'vip' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}

export default function HelpDetailPage({ params }: { params: { id: string } }) {
  return <HelpDetailClient id={params.id} />
}
