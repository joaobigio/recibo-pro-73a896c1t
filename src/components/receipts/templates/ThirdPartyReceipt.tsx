import { formatCurrency, maskCpfCnpj } from '@/lib/format'
import { numeroPorExtenso } from '@/lib/extenso'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'

export function ThirdPartyReceipt({ data, documentTitle }: ReceiptTemplateProps) {
  const { profile } = useAuth()

  const dateObj = data.date ? new Date(`${data.date}T12:00:00`) : new Date()
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)

  const receiptNumber = data.id
    ? `RT${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}-${data.id.substring(0, 5).toUpperCase()}`
    : `RT${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}-00001`

  const issuerDoc = data.issuerDocument || profile?.document || ''
  const isCNPJ = issuerDoc.replace(/\D/g, '').length > 11
  const docTypeLabel = isCNPJ ? 'CNPJ' : 'CPF'

  return (
    <div
      id="print-area"
      className="bg-white p-8 md:p-12 border rounded-lg shadow-sm max-w-3xl mx-auto text-black print:shadow-none print:border-none print:p-0 w-full min-h-[600px] print:max-h-[290mm] print:overflow-hidden flex flex-col justify-between relative font-sans"
    >
      <div>
        <div className="flex justify-between items-start mb-8 min-h-[6rem] gap-4">
          <div className="flex-1 pr-4 z-10">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-[120px] sm:h-[160px] md:h-[200px] w-auto max-w-full object-contain object-left [image-rendering:auto]"
                style={{ imageRendering: 'high-quality' }}
              />
            ) : (
              <div className="font-bold uppercase text-sm break-words pr-4 pt-2">
                {data.issuerName || profile?.name || 'EMISSOR'}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex justify-end items-start pt-2 z-10">
            <h2 className="text-2xl font-bold uppercase text-gray-900 whitespace-nowrap text-right drop-shadow-sm">
              {documentTitle}
            </h2>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="text-sm text-gray-700 font-bold uppercase">Nº {receiptNumber}</div>
          <div className="border border-gray-400 px-4 py-1.5 font-bold uppercase text-xl rounded bg-white min-w-[140px] text-center shadow-sm">
            {formatCurrency(data.amount)}
          </div>
        </div>

        <div className="space-y-4 text-[1.1rem] leading-relaxed text-left text-gray-800">
          <p className="text-justify hyphens-auto">
            Recebi de{' '}
            <strong className="font-bold uppercase text-black">
              {data.issuerName || profile?.name || '________________________________________'}
            </strong>
            , inscrit{isCNPJ ? 'a' : 'o'} no{' '}
            <strong className="font-bold uppercase">{docTypeLabel}</strong> nº{' '}
            <strong className="font-bold uppercase text-black">
              {issuerDoc ? maskCpfCnpj(issuerDoc) : '________________________'}
            </strong>
            , a importância de{' '}
            <strong className="font-bold uppercase text-black">
              {numeroPorExtenso(data.amount) || '________________________________'}
            </strong>
            , referente {data.referencePrefix || 'à'}{' '}
            <strong className="font-bold uppercase text-black break-words">
              {data.description
                ? data.description.replace(/\s+/g, ' ')
                : '________________________________________________________________'}
            </strong>
            .
          </p>

          {(data.paymentMethod || data.paymentMethods?.length || data.clientPixKey) && (
            <p className="pt-2 text-left">
              {(data.paymentMethod || data.paymentMethods?.length) && (
                <>
                  Pagamento via{' '}
                  <strong className="font-bold uppercase text-black">
                    {data.paymentMethods && data.paymentMethods.length > 0
                      ? data.paymentMethods.map((m) => m.type).join(', ')
                      : data.paymentMethod === 'outros' && data.paymentMethodDetails
                        ? data.paymentMethodDetails
                        : (
                            {
                              pix: 'PIX',
                              dinheiro: 'Dinheiro',
                              cartao_credito: 'Cartão de Crédito',
                              cartao_debito: 'Cartão de Débito',
                              transferencia: 'Transferência Bancária',
                              boleto: 'Boleto',
                              outros: 'Outros',
                            } as Record<string, string>
                          )[data.paymentMethod || ''] || data.paymentMethod}
                  </strong>
                </>
              )}
              {data.clientPixKey &&
                (!data.paymentMethod ||
                  data.paymentMethod === 'pix' ||
                  data.paymentMethods?.some((m) => m.type.toLowerCase() === 'pix')) && (
                  <>
                    {data.paymentMethod || data.paymentMethods?.length
                      ? ' - Chave ('
                      : 'Chave PIX ('}
                    {{
                      cpf: 'CPF',
                      cnpj: 'CNPJ',
                      email: 'E-mail',
                      phone: 'Telefone',
                      random: 'Aleatória',
                    }[data.clientPixKeyType || ''] ||
                      data.clientPixKeyType ||
                      'Aleatória'}
                    ):{' '}
                    <strong className="font-bold uppercase text-black">{data.clientPixKey}</strong>
                  </>
                )}
            </p>
          )}

          <p className="text-left">
            {data.dischargeText ||
              'Para maior clareza, firmo o presente recibo, conferindo plena, geral e irrevogável quitação pelo valor recebido, para nada mais reclamar ou exigir a qualquer título, seja presente ou futuro.'}
          </p>

          {data.observations && (
            <p className="pt-2 break-words [overflow-wrap:anywhere] text-left">
              <strong className="font-bold uppercase text-black">OBSERVAÇÃO:</strong>{' '}
              {data.observations.replace(/\s+/g, ' ')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-16 flex flex-col">
        <div className="text-right mb-12 text-lg text-gray-800 font-bold uppercase">
          {formattedDate}
        </div>

        <div className="text-center w-full max-w-md mx-auto relative mt-12">
          <div className="border-t border-gray-800 w-full mb-2"></div>
          <p className="font-bold uppercase text-lg text-gray-900">
            {data.clientName || 'NOME DO RECEBEDOR'}
          </p>
          <p className="text-gray-800 text-base font-medium uppercase mt-1">
            CPF {data.clientDocument ? maskCpfCnpj(data.clientDocument) : '___________________'}
          </p>
        </div>
      </div>
    </div>
  )
}
