import { formatCurrency, formatDate } from '@/lib/format'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptContent } from '../ReceiptContent'

export function ModernReceipt({ data, documentTitle, pixPayload }: ReceiptTemplateProps) {
  const { profile } = useAuth()
  const documentType = data.type || 'receipt'

  return (
    <div
      id="print-area"
      className="bg-white border md:border-2 md:border-slate-800 rounded-xl overflow-hidden max-w-3xl mx-auto text-black print:border-none print:p-0 w-full min-h-[600px] flex flex-col relative font-sans shadow-xl print:shadow-none"
    >
      <div className="bg-slate-900 text-white p-8 md:p-10 flex justify-between items-center print:bg-slate-900 print:text-white print:border-b-4 print:border-slate-900">
        <div className="flex flex-col gap-2">
          {profile?.logo_url && (
            <img
              src={profile.logo_url}
              alt="Logo do Emissor"
              className="h-12 w-auto object-contain object-left mb-2 filter brightness-0 invert"
            />
          )}
          <h2 className="text-2xl font-bold uppercase tracking-widest">{documentTitle}</h2>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">
            Valor Total
          </div>
          <div className="text-3xl font-bold text-white">{formatCurrency(data.amount)}</div>
        </div>
      </div>

      <div className="p-8 md:p-10 flex-1 flex flex-col justify-between bg-slate-50/50 print:bg-transparent">
        <ReceiptContent
          data={data}
          documentType={documentType}
          documentTitle={documentTitle}
          className="space-y-6 text-lg leading-relaxed text-slate-800 text-justify"
        />

        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end">
          <div className="text-center w-1/2 md:w-2/5">
            <div className="border-b-2 border-slate-800 mb-3 mx-4 h-16 flex items-end justify-center relative">
              {data.signature && (
                <img
                  src={data.signature}
                  alt="Assinatura"
                  className="absolute bottom-0 h-16 object-contain"
                />
              )}
            </div>
            <p className="font-bold text-slate-900">{data.issuerName || 'Nome do Emissor'}</p>
            <p className="text-sm text-slate-500">CPF/CNPJ: {data.issuerDocument || 'N/A'}</p>
          </div>

          <div className="text-right flex flex-col items-end w-1/2 md:w-2/5">
            <div className="bg-slate-100 px-4 py-2 rounded-md mb-4 inline-block print:bg-transparent print:px-0">
              <span className="text-slate-500 text-sm mr-2 uppercase font-semibold">Data</span>
              <span className="font-bold text-slate-800">
                {data.date ? formatDate(data.date) : '____/____/______'}
              </span>
            </div>

            {pixPayload && (
              <div className="mt-2 flex flex-col items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100 max-w-[180px] print:shadow-none print:border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(pixPayload)}`}
                  alt="PIX QR Code"
                  className="w-20 h-20 mb-2"
                />
                <span className="text-[10px] font-bold text-slate-800 uppercase mb-1">
                  Pague via PIX
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
