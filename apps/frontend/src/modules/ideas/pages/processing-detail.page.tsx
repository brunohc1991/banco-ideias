'use client';

import { useParams } from 'next/navigation';
import ProcessingDetailComponent from '../components/processing-detail.component';

export default function ProcessingDetailPage() {
  const params = useParams<{ id: string }>();

  return <ProcessingDetailComponent processingId={params.id} />;
}
