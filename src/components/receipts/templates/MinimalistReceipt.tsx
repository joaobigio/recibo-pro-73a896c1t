import { formatCurrency, formatDate, maskCpfCnpj } from '@/lib/format'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptContent } from '../ReceiptContent'

export function MinimalistReceipt({ data, documentTitle, pixPayload }: ReceiptTemplateProps) {
  const { profile } = useAuth()
  const documentType = data.type || 'receipt'

  return (
    <div
      id="print-area"
      className="bg-white max-w-3xl mx-auto text-black p-8 md:p-16 print:p-0 w-full min-h-[600px] flex flex-col justify-between font-sans shadow-sm rounded-md print:shadow-none border print:border-none"
    >
      <div className="flex flex-col items-center text-center mb-12">
        {profile?.logo_url && (
          <img
            src={profile.logo_url}
            alt="Logo do Emissor"
            className="h-20 w-auto max-w-[200px] object-contain mb-6 grayscale opacity-80"
          />
        )}
        <h2 className="text-sm font-medium tracking-[0.3em] uppercase text-gray-400 mb-4">
          {documentTitle}
        </h2>
        <div className="text-5xl font-light text-gray-900 tracking-tight">
          {formatCurrency(data.amount)}
        </div>
        <div className="w-12 h-[1px] bg-gray-300 mt-8"></div>
      </div>

      <ReceiptContent
        data={data}
        documentType={documentType}
        documentTitle={documentTitle}
        className="space-y-6 text-lg leading-loose text-center text-gray-700 max-w-2xl mx-auto"
      />

      <div className="mt-20 flex flex-col items-center">
        <div className="w-64 border-b border-gray-300 mb-4 h-16 flex items-end justify-center relative">
          {data.signature && (
            <img
              src={data.signature}
              alt="Assinatura"
              className="absolute bottom-0 h-16 object-contain"
            />
          )}
        </div>
        <p className="font-medium text-gray-900 tracking-wide">
          {data.issuerName || 'NOME DO EMISSOR'}
        </p>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
          CPF/CNPJ {data.issuerDocument ? maskCpfCnpj(data.issuerDocument) : 'N/A'}
        </p>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
          {data.date ? formatDate(data.date) : '____/____/______'}
        </p>

        {pixPayload && (
          <div className="mt-12 flex flex-col items-center opacity-80">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(pixPayload)}`}
              alt="PIX QR Code"
              className="w-16 h-16 mb-2"
            />
            <span className="text-[9px] font-medium text-gray-500 tracking-widest uppercase">
              PIX
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
