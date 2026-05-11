export const formatCurrency = (value: number | undefined | null) => {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const maskCpfCnpj = (value: string | undefined | null) => {
  if (!value) return ''
  let v = value.replace(/\D/g, '')
  if (v.length > 14) v = v.slice(0, 14)

  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }
  return v
}

export const maskTextCpfCnpj = (text: string) => {
  if (!text) return ''

  return text.replace(/(CPF|CNPJ)[^\d]{0,25}([\d.\-/]*\d)/gi, (match, prefix, doc) => {
    const digits = doc.replace(/\D/g, '')
    if (digits.length === 0) return match

    let masked = digits
    const isCnpj = prefix.toUpperCase() === 'CNPJ'

    if (isCnpj || digits.length > 11) {
      masked = digits
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    } else {
      masked = digits
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }

    return match.slice(0, -doc.length) + masked
  })
}

export const maskPhone = (value: string | undefined | null) => {
  if (!value) return ''
  const v = value.replace(/\D/g, '')

  if (v.length === 0) return ''
  if (v.length <= 2) return `(${v}`
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`
}

export const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}
