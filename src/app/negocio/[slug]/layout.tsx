import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface NegocioLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function NegocioLayout({ 
  children, 
  params 
}: NegocioLayoutProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!negocio) {
    redirect('/')
  }

  // Aplicar colores personalizados del negocio
  const customStyles = negocio.color_primario ? `
    :root {
      --landing-primary: ${negocio.color_primario};
      --landing-secondary: ${negocio.color_secundario || '#64748b'};
    }
  ` : ''

  return (
    <div className="min-h-screen bg-white">
      {customStyles && (
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      )}
      {children}
    </div>
  )
}