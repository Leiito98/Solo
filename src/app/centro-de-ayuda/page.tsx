import type { Metadata } from 'next'
import CentroAyudaClient from './CentroAyudaClient'

export const metadata: Metadata = {
  title: 'Centro de Ayuda · Solo',
  description:
    'Encontrá respuestas a tus preguntas sobre cómo usar Solo para gestionar tu negocio.',
}

export default function Page() {
  return <CentroAyudaClient />
}
