import PersonProfilePage from '@/components/PersonProfilePage'

interface PersonProfileProps {
  params: Promise<{ id: string }>
}

export default async function PersonProfile({ params }: PersonProfileProps) {
  const { id } = await params
  return <PersonProfilePage personId={id} />
}