export function numeroPorExtenso(numero: number): string {
  if (numero === 0) return 'zero reais'

  const inteiros = Math.floor(numero)
  const centavos = Math.round((numero - inteiros) * 100)

  const getGrupo = (n: number): string => {
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
    const dezenasEspeciais = [
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
    const dezenas = [
      '',
      '',
      'vinte',
      'trinta',
      'quarenta',
      'cinquenta',
      'sessenta',
      'setenta',
      'oitenta',
      'noventa',
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

    if (n === 100) return 'cem'

    let str = ''
    const c = Math.floor(n / 100)
    const d = Math.floor((n % 100) / 10)
    const u = n % 10

    if (c > 0) str += centenas[c]

    if (d === 1) {
      if (str) str += ' e '
      str += dezenasEspeciais[u]
    } else {
      if (d > 1) {
        if (str) str += ' e '
        str += dezenas[d]
      }
      if (u > 0) {
        if (str) str += ' e '
        str += unidades[u]
      }
    }
    return str
  }

  const partes = []

  const milhoes = Math.floor(inteiros / 1000000)
  const milhares = Math.floor((inteiros % 1000000) / 1000)
  const centenas = inteiros % 1000

  if (milhoes > 0) {
    partes.push(getGrupo(milhoes) + (milhoes === 1 ? ' milhão' : ' milhões'))
  }

  if (milhares > 0) {
    partes.push(getGrupo(milhares) + ' mil')
  }

  if (centenas > 0 || (inteiros === 0 && centavos === 0)) {
    partes.push(getGrupo(centenas))
  }

  let extensoStr = partes.join(' e ')

  if (inteiros > 0) {
    extensoStr += inteiros === 1 ? ' real' : ' reais'
  }

  if (centavos > 0) {
    const centavosStr = getGrupo(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
    extensoStr += (inteiros > 0 ? ' e ' : '') + centavosStr
  }

  return extensoStr.charAt(0).toUpperCase() + extensoStr.slice(1)
}
