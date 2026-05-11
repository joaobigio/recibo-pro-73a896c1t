import { generatePixPayload } from '@/lib/pix'
import { ReceiptData } from './types'
import { ClassicReceipt } from './templates/ClassicReceipt'
import { ModernReceipt } from './templates/ModernReceipt'
import { MinimalistReceipt } from './templates/MinimalistReceipt'
import { ThirdPartyReceipt } from './templates/ThirdPartyReceipt'

interface ReceiptPreviewProps {
  data: ReceiptData
}

export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  const pixPayload =
    data.showPix && data.issuerPixKey && data.amount > 0
      ? generatePixPayload(data.issuerPixKey, data.amount, data.issuerName || 'Emissor')
      : null

  const titles: Record<string, string> = {
    receipt: 'Recibo',
    third_party: 'Recibo para Terceiros',
    items: 'Recibo',
    rent: 'Recibo de Aluguel',
    promissory: 'Nota Promissória',
    budget: 'Orçamento',
    service_order: 'Ordem de Serviço',
  }
  const documentType = data.type || 'receipt'
  const documentTitle = titles[documentType] || 'Documento'

  const props = { data, documentTitle, pixPayload }

  if (documentType === 'third_party') return <ThirdPartyReceipt {...props} />

  if (data.template === 'modern') return <ModernReceipt {...props} />
  if (data.template === 'minimalist') return <MinimalistReceipt {...props} />

  return <ClassicReceipt {...props} />
}
