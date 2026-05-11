import { formatCurrency, formatDate, maskCpfCnpj } from '@/lib/format'
import { ReceiptTemplateProps } from '../types'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptContent } from '../ReceiptContent'

export function ClassicReceipt({ data, documentTitle, pixPayload }: ReceiptTemplateProps) {
  const { profile } = useAuth()
  const documentType = data.type || 'receipt'

  return (
    <div
      id="print-area"
      className="bg-white p-8 md:p-12 border rounded-lg shadow-sm max-w-3xl mx-auto text-black print:shadow-none print:border-none print:p-0 w-full min-h-[600px] flex flex-col justify-between relative"
    >
      <div>
        <div className="border-b-2 border-gray-200 pb-6 mb-8 flex justify-between items-start">
          <div className="flex flex-col gap-4">
            {profile?.logo_url && (
              <img
                src={profile.logo_url}
                alt="Logo do Emissor"
                className="h-24 w-auto max-w-[250px] object-contain object-left"
              />
            )}
            <h2 className="text-3xl font-bold uppercase tracking-wider text-gray-800">
              {documentTitle}
            </h2>
          </div>
          <div className="bg-gray-100 px-6 py-2 rounded font-semibold text-xl">
            {formatCurrency(data.amount)}
          </div>
        </div>

        <ReceiptContent data={data} documentType={documentType} documentTitle={documentTitle} />
      </div>

      <div className="mt-16 flex justify-between items-end">
        <div className="text-center w-3/5">
          <div className="border-b border-black mb-2 mx-8 h-16 flex items-end justify-center relative">
            {data.signature && (
              <img
                src={data.signature}
                alt="Assinatura"
                className="absolute bottom-0 h-16 object-contain"
              />
            )}
          </div>
          <p className="font-bold">{data.issuerName || 'Nome do Emissor'}</p>
          <p className="text-sm text-gray-600">
            CPF/CNPJ: {data.issuerDocument ? maskCpfCnpj(data.issuerDocument) : 'N/A'}
          </p>
        </div>

        <div className="text-right flex flex-col items-end w-2/5">
          <p className="mb-4 text-gray-700">
            Data:{' '}
            <span className="font-medium">
              {data.date ? formatDate(data.date) : '____/____/______'}
            </span>
          </p>

          {pixPayload && (
            <div className="mt-4 flex flex-col items-center border p-3 rounded-lg bg-gray-50 max-w-[200px]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(pixPayload)}`}
                alt="PIX QR Code"
                className="w-24 h-24 mb-2"
              />
              <span className="text-xs font-bold text-gray-800 uppercase mb-1">Pague com PIX</span>
              <p className="text-[8px] text-gray-500 break-all leading-tight text-center select-all">
                {pixPayload}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
