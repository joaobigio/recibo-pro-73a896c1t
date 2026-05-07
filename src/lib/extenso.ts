const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const dezenas = [
  '',
  'dez',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
]
const especiais = [
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
]
const centenas = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
]

function numeroParaPalavras(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'

  const partes = []
  const c = Math.floor(n / 100)
  const r = n % 100
  const d = Math.floor(r / 10)
  const u = r % 10

  if (c > 0) partes.push(centenas[c])

  if (d === 1) {
    partes.push(especiais[u])
  } else {
    if (d > 1) partes.push(dezenas[d])
    if (u > 0 && d !== 1) partes.push(unidades[u])
  }

  return partes.join(' e ')
}

export function numeroPorExtenso(valor: number): string {
  if (!valor || valor === 0) return 'zero reais'

  const reais = Math.floor(valor)
  const centavos = Math.round((valor - reais) * 100)

  let extensoReais = ''
  if (reais > 0) {
    if (reais >= 1000000) {
      const milhoes = Math.floor(reais / 1000000)
      const restoMilhoes = reais % 1000000
      extensoReais += numeroParaPalavras(milhoes) + (milhoes === 1 ? ' milhão' : ' milhões')

      const milhares = Math.floor(restoMilhoes / 1000)
      if (milhares > 0) {
        extensoReais += ' e ' + (milhares === 1 ? 'um' : numeroParaPalavras(milhares)) + ' mil'
      }
      const restoMil = restoMilhoes % 1000
      if (restoMil > 0) extensoReais += ' e ' + numeroParaPalavras(restoMil)
    } else if (reais >= 1000) {
      const milhares = Math.floor(reais / 1000)
      const restoMilhares = reais % 1000
      extensoReais += (milhares === 1 ? 'um' : numeroParaPalavras(milhares)) + ' mil'
      if (restoMilhares > 0) extensoReais += ' e ' + numeroParaPalavras(restoMilhares)
    } else {
      extensoReais += numeroParaPalavras(reais)
    }
    extensoReais += reais === 1 ? ' real' : ' reais'
  }

  let extensoCentavos = ''
  if (centavos > 0) {
    extensoCentavos += numeroParaPalavras(centavos)
    extensoCentavos += centavos === 1 ? ' centavo' : ' centavos'
  }

  if (reais > 0 && centavos > 0) {
    return `${extensoReais} e ${extensoCentavos}`
  } else if (reais > 0) {
    return extensoReais
  } else {
    return extensoCentavos
  }
}
