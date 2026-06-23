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
      className="bg-white p-8 md:p-12 max-w-3xl mx-auto text-slate-800 shadow-2xl rounded-2xl print:shadow-none print:p-0 w-full min-h-[600px] print:max-h-[290mm] print:overflow-hidden flex flex-col relative font-sans border border-slate-100 print:border-none"
    >
      <div className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-20 md:h-24 w-auto max-w-full object-contain object-left"
                style={{ imageRendering: 'high-quality' }}
              />
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  {(data.issuerName || profile?.name || 'E').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    {data.issuerName || profile?.name || 'EMISSOR'}
                  </h1>
                  {data.issuerDocument && (
                    <p className="text-sm text-slate-500 font-medium">
                      {maskCpfCnpj(data.issuerDocument)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl w-full md:w-auto md:min-w-[280px] border border-slate-100 shadow-sm text-right">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
              {documentTitle}
            </h2>
            <div className="text-3xl font-black text-slate-900 mb-2">
              {formatCurrency(data.amount)}
            </div>
            <div className="text-xs font-bold text-slate-400">
              <span>Nº {receiptNumber}</span>
            </div>
          </div>
        </div>

        <div className="mb-10 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
          {documentType === 'third_party' ? (
            <ThirdPartyContent
              data={data}
              className="space-y-4 text-[1.1rem] leading-relaxed text-slate-700"
            />
          ) : (
            <ReceiptContent
              data={data}
              documentType={documentType}
              documentTitle={documentTitle}
              className="space-y-4 text-[1.1rem] leading-relaxed text-slate-700"
            />
          )}
        </div>

        {(data.paymentMethod || data.clientPixKey) && (
          <div className="flex flex-wrap gap-4 mb-8">
            {data.paymentMethod && (
              <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Pagamento via
                </span>
                <span className="text-sm font-bold text-slate-700">
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
              <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Chave PIX
                </span>
                <span className="text-sm font-bold text-slate-700">
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

      <footer className="mt-12 flex flex-col">
        <div className="text-right text-slate-600 font-medium">
          {data.local ? <span>{data.local}, </span> : ''}
          <span>{data.date ? formatDate(data.date) : '____/____/______'}</span>
        </div>

        <div className="h-[4.5rem]"></div>

        <div className="w-full max-w-[320px] mx-auto text-center flex flex-col items-center">
          <div className="border-t-2 border-slate-200 w-full mb-4"></div>
          <p className="font-bold text-slate-900 text-lg uppercase">
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
