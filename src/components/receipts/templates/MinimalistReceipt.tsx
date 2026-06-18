import { formatCurrency, formatDate, maskCpfCnpj } from '@/lib/format'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptContent } from '../ReceiptContent'

export function MinimalistReceipt({ data, documentTitle }: ReceiptTemplateProps) {
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
        <div className="flex justify-between items-start mb-6 relative">
          <div className="w-1/3">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-32 w-auto max-w-[320px] object-contain object-left"
              />
            ) : (
              <div className="font-bold uppercase text-sm break-words pr-4">
                {data.issuerName || profile?.name || 'EMISSOR'}
              </div>
            )}
          </div>
          <div className="w-1/3 flex justify-center pt-2">
            <h2 className="text-xl font-bold uppercase text-gray-900 whitespace-nowrap">
              {documentTitle}
            </h2>
          </div>
          <div className="w-1/3"></div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="text-sm text-gray-700 font-bold uppercase">Nº {receiptNumber}</div>
          <div className="text-right">
            <div className="font-light text-3xl tracking-tight text-gray-900 mb-1">
              {formatCurrency(data.amount)}
            </div>
            {data.paymentMethod && (
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
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
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                {data.clientPixKeyType
                  ? `PIX CLIENTE (${
                      {
                        cpf: 'CPF',
                        cnpj: 'CNPJ',
                        email: 'E-mail',
                        phone: 'Telefone',
                        random: 'Aleatória',
                      }[data.clientPixKeyType] || data.clientPixKeyType
                    }): `
                  : 'PIX CLIENTE: '}
                {data.clientPixKey}
              </div>
            )}
          </div>
        </div>

        <ReceiptContent
          data={data}
          documentType={documentType}
          documentTitle={documentTitle}
          className="space-y-4 text-[1.1rem] leading-relaxed text-left text-gray-800"
        />
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
