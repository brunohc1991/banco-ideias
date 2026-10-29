'use client';

import { useParams } from 'next/navigation';
import IdeaTypeFormComponent from '../components/idea-type-form.component';

export default function IdeaTypeFormPage() {
  const params = useParams<{ id?: string }>();

  return <IdeaTypeFormComponent ideaTypeId={params.id} />;
}
