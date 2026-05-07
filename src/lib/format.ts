export const formatCurrency = (value: number | undefined | null) => {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}
