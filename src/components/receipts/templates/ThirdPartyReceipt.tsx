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
      className="bg-white p-8 md:p-12 border rounded-lg shadow-sm max-w-3xl mx-auto text-black print:shadow-none print:border-none print:p-0 w-full min-h-[600px] flex flex-col justify-between relative font-sans"
    >
      <div>
        <div className="flex justify-between items-start mb-6 relative">
          <div className="w-1/3">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-32 w-auto max-w-[320px] object-contain object-left"
              />
            ) : (
              <div className="font-bold text-sm break-words pr-4">
                {data.issuerName || profile?.name || 'EMISSOR'}
              </div>
            )}
          </div>
          <div className="w-1/3 flex justify-center pt-2">
            <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">{documentTitle}</h2>
          </div>
          <div className="w-1/3"></div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="text-sm text-gray-700 font-medium">Nº {receiptNumber}</div>
          <div className="border border-gray-400 px-4 py-1.5 font-bold text-xl rounded bg-white min-w-[140px] text-center shadow-sm">
            {formatCurrency(data.amount)}
          </div>
        </div>

        <div className="space-y-4 text-[1.1rem] leading-relaxed text-justify text-gray-800">
          <p>
            Recebi de{' '}
            <strong className="font-bold uppercase text-black">
              {data.issuerName || profile?.name || '________________________________________'}
            </strong>
            , inscrit{isCNPJ ? 'a' : 'o'} no {docTypeLabel} nº{' '}
            <strong className="font-bold text-black">
              {issuerDoc ? maskCpfCnpj(issuerDoc) : '________________________'}
            </strong>
            , a importância de{' '}
            <strong className="font-bold lowercase text-black">
              {numeroPorExtenso(data.amount) || '________________________________'}
            </strong>
            , referente {data.referencePrefix || 'à'}{' '}
            <strong className="font-bold text-black">
              {data.description ||
                '________________________________________________________________'}
            </strong>
            .
          </p>

          {(data.paymentMethod || data.clientPixKey) && (
            <p className="pt-2">
              {data.paymentMethod && (
                <>
                  Pagamento via{' '}
                  <strong className="font-bold text-black">
                    {data.paymentMethod === 'outros' && data.paymentMethodDetails
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
                        )[data.paymentMethod] || data.paymentMethod}
                  </strong>
                </>
              )}
              {data.clientPixKey && (!data.paymentMethod || data.paymentMethod === 'pix') && (
                <>
                  {data.paymentMethod ? ' - Chave (' : 'Chave PIX ('}
                  {{
                    cpf: 'CPF',
                    cnpj: 'CNPJ',
                    email: 'E-mail',
                    phone: 'Telefone',
                    random: 'Aleatória',
                  }[data.clientPixKeyType || ''] ||
                    data.clientPixKeyType ||
                    'Aleatória'}
                  ): <strong className="font-bold text-black">{data.clientPixKey}</strong>
                </>
              )}
            </p>
          )}

          <p>
            Para maior clareza, firmo o presente recibo, conferindo plena, geral e irrevogável
            quitação pelo valor recebido.
          </p>

          {data.observations && (
            <p className="pt-2 break-words [overflow-wrap:anywhere]">
              <strong className="font-bold text-black">Observação:</strong> {data.observations}
            </p>
          )}
        </div>
      </div>

      <div className="mt-16 flex flex-col">
        <div className="text-right mb-8 text-lg text-gray-800">{formattedDate}</div>

        <div className="text-center w-full max-w-md mx-auto relative mt-8">
          <p className="font-bold uppercase text-lg text-gray-900">
            {data.clientName || 'NOME DO RECEBEDOR'}
          </p>
          <p className="text-gray-800 text-base">
            CPF {data.clientDocument ? maskCpfCnpj(data.clientDocument) : '___________________'}
          </p>
        </div>
      </div>
    </div>
  )
}
