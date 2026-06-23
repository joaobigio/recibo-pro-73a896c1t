import { formatCurrency, formatDate, maskCpfCnpj } from '@/lib/format'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptContent } from '../ReceiptContent'
import { ThirdPartyContent } from '../ThirdPartyContent'

export function ModernReceipt({ data, documentTitle }: ReceiptTemplateProps) {
  const { profile } = useAuth()
  const documentType = data.type || 'receipt'

  const dateObj = data.date ? new Date(`${data.date}T12:00:00`) : new Date()
  const receiptNumber = data.id
    ? `RC${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}-${data.id.substring(0, 5).toUpperCase()}`
    : `RC${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}-00001`

  return (
    <div
      id="print-area"
      className="bg-white p-8 md:p-12 border border-slate-200 shadow-xl rounded-2xl max-w-3xl mx-auto text-slate-800 print:shadow-none print:border-none print:p-0 w-full min-h-[600px] print:max-h-[290mm] print:overflow-hidden flex flex-col justify-between relative font-sans"
    >
      <div>
        <div className="flex justify-between items-start mb-8 gap-4">
          <div className="flex-1 pr-4 z-10">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-[120px] sm:h-[160px] md:h-[200px] w-auto max-w-full object-contain object-left [image-rendering:auto]"
                style={{ imageRendering: 'high-quality' }}
              />
            ) : (
              <div className="font-bold uppercase text-sm break-words pr-4 pt-2 text-slate-400">
                {data.issuerName || profile?.name || 'EMISSOR'}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col items-end pt-2 z-10">
            <h2 className="text-3xl font-black uppercase text-slate-900 whitespace-nowrap text-right tracking-tight">
              {documentTitle}
            </h2>
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">
              Nº {receiptNumber}
            </div>
            <div className="mt-4 bg-blue-600 text-white px-6 py-2 font-bold uppercase text-2xl rounded-lg shadow-md min-w-[160px] text-center">
              {formatCurrency(data.amount)}
            </div>
          </div>
        </div>

        <div className="mb-8 border-b border-slate-100 pb-6">
          <div className="space-y-2 mt-2 flex gap-4 flex-wrap">
            {data.paymentMethod && (
              <div className="text-xs text-slate-600 font-bold uppercase flex items-center gap-2">
                <span className="text-slate-400">Pagamento:</span>
                <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800">
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
                </span>
              </div>
            )}
            {data.clientPixKey && (
              <div className="text-xs text-slate-600 font-bold uppercase flex items-center gap-2">
                <span className="text-slate-400">
                  {data.clientPixKeyType
                    ? `PIX Cliente (${
                        {
                          cpf: 'CPF',
                          cnpj: 'CNPJ',
                          email: 'E-mail',
                          phone: 'Telefone',
                          random: 'Aleatória',
                        }[data.clientPixKeyType] || data.clientPixKeyType
                      }):`
                    : 'PIX Cliente:'}
                </span>
                <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800">
                  {data.clientPixKey}
                </span>
              </div>
            )}
          </div>
        </div>

        {documentType === 'third_party' ? (
          <ThirdPartyContent
            data={data}
            className="space-y-4 text-[1.1rem] leading-relaxed text-left text-slate-700"
          />
        ) : (
          <ReceiptContent
            data={data}
            documentType={documentType}
            documentTitle={documentTitle}
            className="space-y-4 text-[1.1rem] leading-relaxed text-left text-slate-700"
          />
        )}
      </div>

      <div className="mt-20 flex justify-between items-end">
        <div className="text-center w-3/5">
          <div className="border-t-2 border-slate-200 w-4/5 mx-auto mb-3"></div>
          <p className="font-bold text-slate-900 uppercase">
            {documentType === 'third_party'
              ? data.clientName || 'NOME DO RECEBEDOR'
              : data.issuerName || 'Nome do Emissor'}
          </p>
          <p className="text-sm text-slate-500">
            CPF/CNPJ:{' '}
            {documentType === 'third_party'
              ? data.clientDocument
                ? maskCpfCnpj(data.clientDocument)
                : '___________________'
              : data.issuerDocument
                ? maskCpfCnpj(data.issuerDocument)
                : 'N/A'}
          </p>
        </div>

        <div className="text-right flex flex-col items-end w-2/5">
          <p className="mb-4 text-slate-600 font-bold uppercase">
            Data:{' '}
            <span className="text-slate-900">
              {data.date ? formatDate(data.date) : '____/____/______'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
