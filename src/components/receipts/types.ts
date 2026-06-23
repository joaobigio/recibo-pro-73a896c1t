export interface ReceiptData {
  id?: string
  type?: string
  template?: string
  amount: number
  date: string
  local?: string
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
  referencePrefix?: string
  paymentMethods?: { type: string }[]
  paymentMethod?: string
  paymentMethodDetails?: string
  observations?: string
  payment_method?: string
  pix_key?: string
  client_pix_key?: string
  client_pix_key_type?: string
  documentNumber?: string
  items?: { id: string; description: string; quantity: number; unitPrice: number }[]
  discount?: number
  surcharge?: number
  subtotal?: number
}

export interface ReceiptTemplateProps {
  data: ReceiptData
  documentTitle: string
}
