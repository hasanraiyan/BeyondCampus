import UniversityChatInterface from '@/components/UniversityChatInterface';
import { use } from 'react';

export default function UniversityChat({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <UniversityChatInterface universityId={id} />;
}
