export interface ReceiptData {
  id?: string
  type?: string
  template?: string
  amount: number
  date: string
  clientName: string
  clientDocument: string
  clientPixKey?: string
  clientPixKeyType?: string
  clientStreet?: string
  clientNumber?: string
  clientNeighborhood?: string
  clientCity?: string
  clientState?: string
  clientCep?: string
  description: string
  issuerName?: string
  issuerDocument?: string
  issuerPixKey?: string
  showPix?: boolean
  signature?: string | null
  referencePrefix?: string
  paymentMethods?: { type: string }[]
  paymentMethod?: string
  paymentMethodDetails?: string
  observations?: string
  payment_method?: string
  pix_key?: string
  client_pix_key?: string
  client_pix_key_type?: string
}

export interface ReceiptTemplateProps {
  data: ReceiptData
  documentTitle: string
  pixPayload: string | null
}
