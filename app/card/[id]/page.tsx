import { notFound } from 'next/navigation';
import { CardClient } from './CardClient';
import { getCardById } from '@/lib/cards';

export default function CardPage({ params }: { params: { id: string } }) {
  const card = getCardById(params.id);
  if (!card) {
    notFound();
  }

  return <CardClient card={card} />;
}
