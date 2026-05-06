import { formatCurrency, formatDate } from '@/lib/format'
import { numeroPorExtenso } from '@/lib/extenso'
import { generatePixPayload } from '@/lib/pix'

interface ReceiptPreviewProps {
  data: {
    amount: number
    date: string
    clientName: string
    clientDocument: string
    description: string
    issuerName: string
    issuerDocument: string
    issuerPixKey: string
    showPix: boolean
    signature: string | null
  }
}

export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  const pixPayload =
    data.showPix && data.issuerPixKey && data.amount > 0
      ? generatePixPayload(data.issuerPixKey, data.amount, data.issuerName || 'Emissor')
      : null

  return (
    <div
      id="print-area"
      className="bg-white p-8 md:p-12 border rounded-lg shadow-sm max-w-3xl mx-auto text-black print:shadow-none print:border-none print:p-0 w-full min-h-[600px] flex flex-col justify-between"
    >
      <div>
        <div className="text-center border-b-2 border-gray-200 pb-6 mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold uppercase tracking-wider text-gray-800">Recibo</h2>
          <div className="bg-gray-100 px-6 py-2 rounded font-semibold text-xl">
            {formatCurrency(data.amount)}
          </div>
        </div>

        <div className="space-y-6 text-lg leading-loose text-justify">
          <p>
            Recebi(emos) de{' '}
            <strong className="font-semibold uppercase">
              {data.clientName || '________________________________________'}
            </strong>
            , inscrito no CPF/CNPJ sob o nº{' '}
            <strong className="font-semibold">
              {data.clientDocument || '________________________'}
            </strong>
            , a importância de{' '}
            <strong className="font-semibold uppercase">
              {numeroPorExtenso(data.amount) || '________________________________'}
            </strong>
            , referente a{' '}
            <strong className="font-semibold">
              {data.description ||
                '________________________________________________________________'}
            </strong>
            .
          </p>
          <p>Para maior clareza e validade, firmo(amos) o presente recibo.</p>
        </div>
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
          <p className="text-sm text-gray-600">CPF/CNPJ: {data.issuerDocument || 'N/A'}</p>
        </div>

        <div className="text-right flex flex-col items-end w-2/5">
          <p className="mb-4 text-gray-700">
            Data:{' '}
            <span className="font-medium">
              {data.date ? formatDate(data.date) : '____/____/______'}
            </span>
          </p>

          {pixPayload && (
            <div className="mt-4 flex flex-col items-center border p-2 rounded-lg bg-gray-50">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(pixPayload)}`}
                alt="PIX QR Code"
                className="w-24 h-24 mb-1"
              />
              <span className="text-xs font-semibold text-gray-600">Pague com PIX</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
