import { ReceiptData } from './types'
import { ClassicReceipt } from './templates/ClassicReceipt'
import { ModernReceipt } from './templates/ModernReceipt'
import { MinimalistReceipt } from './templates/MinimalistReceipt'
import { ThirdPartyReceipt } from './templates/ThirdPartyReceipt'

interface ReceiptPreviewProps {
  data: ReceiptData
}

export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  const normalizedData = {
    ...data,
    paymentMethod: data.paymentMethod || data.payment_method,
    clientPixKey: data.clientPixKey !== undefined ? data.clientPixKey : data.client_pix_key,
    clientPixKeyType:
      data.clientPixKeyType !== undefined ? data.clientPixKeyType : data.client_pix_key_type,
    issuerPixKey: undefined,
    pix_key: undefined,
  }

  const titles: Record<string, string> = {
    receipt: 'Recibo',
    third_party: 'Recibo para Terceiros',
    items: 'Recibo',
    rent: 'Recibo de Aluguel',
    promissory: 'Nota Promissória',
    budget: 'Orçamento',
    service_order: 'Ordem de Serviço',
  }
  const documentType = normalizedData.type || 'receipt'
  const documentTitle = titles[documentType] || 'Documento'

  const props = { data: normalizedData, documentTitle }

  if (documentType === 'third_party') return <ThirdPartyReceipt {...props} />

  if (normalizedData.template === 'modern') return <ModernReceipt {...props} />
  if (normalizedData.template === 'minimalist') return <MinimalistReceipt {...props} />

  return <ClassicReceipt {...props} />
}
