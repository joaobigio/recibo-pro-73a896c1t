function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

function formatField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0')
  return `${id}${length}${value}`
}

export function generatePixPayload(
  pixKey: string,
  amount: number,
  merchantName: string,
  merchantCity: string = 'SAO PAULO',
  txid: string = '***',
): string {
  const payloadFormat = formatField('00', '01')
  const merchantAccount = formatField(
    '26',
    formatField('00', 'br.gov.bcb.pix') + formatField('01', pixKey),
  )
  const merchantCategoryCode = formatField('52', '0000')
  const transactionCurrency = formatField('53', '986')
  const transactionAmount = amount > 0 ? formatField('54', amount.toFixed(2)) : ''
  const countryCode = formatField('58', 'BR')
  const name = formatField('59', merchantName.substring(0, 25).trim())
  const city = formatField('60', merchantCity.substring(0, 15).trim())
  const additionalData = formatField('62', formatField('05', txid))

  const payloadStr =
    payloadFormat +
    merchantAccount +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    name +
    city +
    additionalData +
    '6304'

  return payloadStr + crc16(payloadStr)
}
