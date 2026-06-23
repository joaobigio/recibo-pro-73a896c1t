import { formatCurrency, formatDate, maskCpfCnpj } from '@/lib/format'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptContent } from '../ReceiptContent'

export function ClassicReceipt({ data, documentTitle }: ReceiptTemplateProps) {
  const { profile } = useAuth()
  const documentType = data.type || 'receipt'

  const dateObj = data.date ? new Date(`${data.date}T12:00:00`) : new Date()
  const receiptNumber = data.id
    ? `RC${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}-${data.id.substring(0, 5).toUpperCase()}`
    : `RC${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}-00001`

  return (
    <div
      id="print-area"
      className="bg-white p-8 md:p-12 border rounded-lg shadow-sm max-w-3xl mx-auto text-black print:shadow-none print:border-none print:p-0 w-full min-h-[600px] print:max-h-[290mm] print:overflow-hidden flex flex-col justify-between relative font-sans"
    >
      <div>
        <div className="flex justify-between items-start mb-6 relative min-h-[4rem]">
          <div className="w-1/2 pr-4 z-10">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-[80px] sm:h-[100px] md:h-[120px] w-auto max-w-full object-contain object-left [image-rendering:auto]"
              />
            ) : (
              <div className="font-bold uppercase text-sm break-words pr-4">
                {data.issuerName || profile?.name || 'EMISSOR'}
              </div>
            )}
          </div>
          <div className="absolute inset-x-0 top-0 flex justify-center items-start pt-2 pointer-events-none">
            <h2 className="text-xl font-bold uppercase text-gray-900 whitespace-nowrap px-4">
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

        <ReceiptContent
          data={data}
          documentType={documentType}
          documentTitle={documentTitle}
          className="space-y-4 text-[1.1rem] leading-relaxed text-left text-gray-800"
        />

        {(data.paymentMethod || data.clientPixKey) && (
          <div className="mt-6 text-[1.1rem] text-gray-800 space-y-1">
            {data.paymentMethod && (
              <div>
                <span className="font-bold uppercase">Forma de Pagamento: </span>
                {data.paymentMethod === 'outros' && data.paymentMethodDetails
                  ? data.paymentMethodDetails
                  : (
                      {
                        pix: 'Pix',
                        dinheiro: 'Dinheiro',
                        cartao_credito: 'Cartão de Crédito',
                        cartao_debito: 'Cartão de Débito',
                        transferencia: 'Transferência Bancária',
                        boleto: 'Boleto',
                        outros: 'Outros',
                      } as Record<string, string>
                    )[data.paymentMethod] || data.paymentMethod}
              </div>
            )}
            {data.clientPixKey && (
              <div>
                <span className="font-bold uppercase">
                  {data.clientPixKeyType
                    ? `Chave PIX Cliente (${
                        {
                          cpf: 'CPF',
                          cnpj: 'CNPJ',
                          email: 'E-mail',
                          phone: 'Telefone',
                          random: 'Aleatória',
                        }[data.clientPixKeyType] || data.clientPixKeyType
                      }): `
                    : 'Chave PIX (Cliente): '}
                </span>
                {data.clientPixKey}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-20 flex justify-between items-end">
        <div className="text-center w-3/5">
          <div className="border-t border-gray-800 w-4/5 mx-auto mb-2"></div>
          <p className="font-bold uppercase">{data.issuerName || 'Nome do Emissor'}</p>
          <p className="text-sm text-gray-600">
            CPF/CNPJ: {data.issuerDocument ? maskCpfCnpj(data.issuerDocument) : 'N/A'}
          </p>
        </div>

        <div className="text-right flex flex-col items-end w-2/5">
          <p className="mb-4 text-gray-700 font-bold uppercase">
            Data: <span className="">{data.date ? formatDate(data.date) : '____/____/______'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
