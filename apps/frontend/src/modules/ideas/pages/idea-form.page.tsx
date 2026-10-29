'use client';

import { useParams } from 'next/navigation';
import IdeaFormComponent from '../components/idea-form.component';

export default function IdeaFormPage() {
  const params = useParams<{ id?: string }>();

  return <IdeaFormComponent ideaId={params.id} />;
}
