import { ReceiptTemplateProps } from '../types'
import { ClassicReceipt } from './ClassicReceipt'
import { ModernReceipt } from './ModernReceipt'
import { MinimalistReceipt } from './MinimalistReceipt'

export function ThirdPartyReceipt(props: ReceiptTemplateProps) {
  const { data } = props
  if (data.template === 'modern') return <ModernReceipt {...props} />
  if (data.template === 'minimalist') return <MinimalistReceipt {...props} />
  return <ClassicReceipt {...props} />
}
