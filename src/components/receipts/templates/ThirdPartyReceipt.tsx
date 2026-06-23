import { ReceiptTemplateProps } from '../types'
import { ClassicReceipt } from './ClassicReceipt'

export function ThirdPartyReceipt(props: ReceiptTemplateProps) {
  return <ClassicReceipt {...props} />
}
