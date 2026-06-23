import { formatCurrency, formatDate, maskCpfCnpj } from '@/lib/format'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptContent } from '../ReceiptContent'
import { ThirdPartyContent } from '../ThirdPartyContent'

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
      className="bg-white p-8 md:p-12 max-w-3xl mx-auto text-gray-800 print:p-0 w-full min-h-[600px] print:max-h-[290mm] print:overflow-hidden flex flex-col relative font-sans"
    >
      <div>
        <div className="flex justify-between items-start mb-12 gap-4">
          <div className="flex-1 pr-4 z-10">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-[120px] sm:h-[160px] md:h-[200px] w-auto max-w-full object-contain object-left"
                style={{ imageRendering: 'high-quality', filter: 'grayscale(100%) opacity(90%)' }}
              />
            ) : (
              <div className="font-light uppercase text-sm tracking-widest break-words pr-4 pt-2 text-gray-400">
                {data.issuerName || profile?.name || 'EMISSOR'}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col items-end pt-2 z-10">
            <h2 className="text-sm font-normal text-gray-400 uppercase tracking-widest whitespace-nowrap text-right mb-2">
              {documentTitle}
            </h2>
            <div className="font-light text-5xl tracking-tighter text-gray-900 mb-1">
              {formatCurrency(data.amount)}
            </div>
            <div className="text-xs text-gray-400 font-light tracking-widest mt-1">
              Nº {receiptNumber}
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex flex-col gap-1 items-end">
            {data.paymentMethod && (
              <div className="text-xs text-gray-400 uppercase tracking-widest">
                PAGAMENTO:{' '}
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
              <div className="text-xs text-gray-400 uppercase tracking-widest">
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

        {documentType === 'third_party' ? (
          <ThirdPartyContent
            data={data}
            className="space-y-4 text-[1.1rem] leading-relaxed text-left text-gray-600 font-light"
          />
        ) : (
          <ReceiptContent
            data={data}
            documentType={documentType}
            documentTitle={documentTitle}
            className="space-y-4 text-[1.1rem] leading-relaxed text-left text-gray-600 font-light"
          />
        )}
      </div>

      <div className="mt-24 flex justify-between items-end">
        <div className="text-center w-3/5">
          <div className="border-t border-gray-200 w-4/5 mx-auto mb-3"></div>
          <p className="font-normal text-gray-800 uppercase tracking-wide">
            {documentType === 'third_party'
              ? data.clientName || 'NOME DO RECEBEDOR'
              : data.issuerName || 'Nome do Emissor'}
          </p>
          <p className="text-xs text-gray-400 tracking-widest mt-1">
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
          <p className="mb-4 text-gray-400 font-light uppercase tracking-widest text-sm">
            Data:{' '}
            <span className="text-gray-800">
              {data.date ? formatDate(data.date) : '____/____/______'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
