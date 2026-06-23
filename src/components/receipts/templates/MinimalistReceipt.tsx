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
      className="bg-white p-8 md:p-12 max-w-3xl mx-auto text-slate-800 print:p-0 w-full min-h-[600px] print:max-h-[290mm] print:overflow-hidden flex flex-col relative font-sans"
    >
      <div className="flex-1">
        <header className="flex justify-between items-start mb-16">
          <div className="flex-1 pr-8">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-16 w-auto max-w-full object-contain object-left grayscale opacity-80"
              />
            ) : (
              <h1 className="text-xl font-medium tracking-wide text-slate-900 uppercase">
                {data.issuerName || profile?.name || 'EMISSOR'}
              </h1>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">
              {documentTitle}
            </h2>
            <div className="text-4xl font-light tracking-tight text-slate-900 mb-2">
              {formatCurrency(data.amount)}
            </div>
            <div className="text-xs text-slate-400 font-medium tracking-wider">
              Nº {receiptNumber}
            </div>
          </div>
        </header>

        <main className="mb-12">
          {documentType === 'third_party' ? (
            <ThirdPartyContent
              data={data}
              className="space-y-6 text-lg leading-relaxed text-slate-600 font-light"
            />
          ) : (
            <ReceiptContent
              data={data}
              documentType={documentType}
              documentTitle={documentTitle}
              className="space-y-6 text-lg leading-relaxed text-slate-600 font-light"
            />
          )}
        </main>

        {(data.paymentMethod || data.clientPixKey) && (
          <div className="border-t border-slate-100 pt-6 mt-12 grid grid-cols-2 gap-8 text-sm">
            {data.paymentMethod && (
              <div>
                <span className="text-slate-400 uppercase tracking-widest text-xs block mb-1">
                  Método de Pagamento
                </span>
                <span className="text-slate-700 font-medium">
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
              <div>
                <span className="text-slate-400 uppercase tracking-widest text-xs block mb-1">
                  Chave PIX
                </span>
                <span className="text-slate-700 font-medium">
                  {data.clientPixKeyType && data.clientPixKeyType !== 'random'
                    ? `${data.clientPixKeyType.toUpperCase()}: `
                    : ''}
                  {data.clientPixKey}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-16 flex flex-col">
        <div className="text-right text-slate-600 font-normal">
          {data.local ? <span>{data.local}, </span> : ''}
          <span>{data.date ? formatDate(data.date) : '____/____/______'}</span>
        </div>

        <div className="h-[4.5rem]"></div>

        <div className="w-full max-w-[320px] mx-auto text-center flex flex-col items-center">
          <div className="border-t border-slate-300 w-full mb-4"></div>
          <p className="font-medium text-slate-900 text-lg uppercase tracking-wide">
            {documentType === 'third_party'
              ? data.clientName || 'NOME DO RECEBEDOR'
              : data.issuerName || 'NOME DO EMISSOR'}
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
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
      </footer>
    </div>
  )
}
