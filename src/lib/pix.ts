function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function format(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

export function generatePixPayload(
  pixKey: string,
  amount: number,
  merchantName: string,
  merchantCity: string = 'BRASIL',
): string {
  const payloadFormatIndicator = format('00', '01')
  const pointOfInitiationMethod = amount > 0 ? format('01', '12') : ''

  const gui = format('00', 'br.gov.bcb.pix')
  const key = format('01', pixKey)
  const merchantAccountInfo = format('26', gui + key)

  const merchantCategoryCode = format('52', '0000')
  const transactionCurrency = format('53', '986')
  const transactionAmount = amount > 0 ? format('54', amount.toFixed(2)) : ''
  const countryCode = format('58', 'BR')

  const name = format(
    '59',
    merchantName
      .substring(0, 25)
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .toUpperCase() || 'MERCHANT',
  )
  const city = format(
    '60',
    merchantCity
      .substring(0, 15)
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .toUpperCase() || 'CITY',
  )

  const txId = format('05', '***')
  const additionalDataField = format('62', txId)

  let payload =
    payloadFormatIndicator +
    pointOfInitiationMethod +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    name +
    city +
    additionalDataField

  payload += '6304'
  const crc = crc16(payload)

  return payload + crc
}
