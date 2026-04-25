import PartyDetailClient from './PartyDetailClient'

// 静态导出需要的预定义参数
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' },
    { id: '11' },
    { id: '12' },
  ]
}

export default function PartyDetailPage({ params }: { params: { id: string } }) {
  return <PartyDetailClient id={params.id} />
}
