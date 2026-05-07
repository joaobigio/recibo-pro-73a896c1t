import { formatCurrency, formatDate } from '@/lib/format'
import { numeroPorExtenso } from '@/lib/extenso'
import { generatePixPayload } from '@/lib/pix'

interface ReceiptPreviewProps {
  data: {
    type?: string
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

  const titles: Record<string, string> = {
    receipt: 'Recibo',
    promissory: 'Nota Promissória',
    budget: 'Orçamento',
    service_order: 'Ordem de Serviço',
  }
  const documentType = data.type || 'receipt'
  const documentTitle = titles[documentType] || 'Documento'

  return (
    <div
      id="print-area"
      className="bg-white p-8 md:p-12 border rounded-lg shadow-sm max-w-3xl mx-auto text-black print:shadow-none print:border-none print:p-0 w-full min-h-[600px] flex flex-col justify-between"
    >
      <div>
        <div className="text-center border-b-2 border-gray-200 pb-6 mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold uppercase tracking-wider text-gray-800">
            {documentTitle}
          </h2>
          <div className="bg-gray-100 px-6 py-2 rounded font-semibold text-xl">
            {formatCurrency(data.amount)}
          </div>
        </div>

        <div className="space-y-6 text-lg leading-loose text-justify">
          {documentType === 'promissory' && (
            <p>
              No dia{' '}
              <strong className="font-semibold">
                {data.date ? formatDate(data.date) : '____/____/______'}
              </strong>
              , pagarei(emos) por esta única via de NOTA PROMISSÓRIA a{' '}
              <strong className="font-semibold uppercase">
                {data.issuerName || '________________________________________'}
              </strong>
              , o valor de{' '}
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
          )}

          {documentType === 'receipt' && (
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
          )}

          {documentType === 'budget' && (
            <p>
              Apresentamos o presente <strong className="font-semibold uppercase">ORÇAMENTO</strong>{' '}
              para o cliente{' '}
              <strong className="font-semibold uppercase">
                {data.clientName || '________________________________________'}
              </strong>
              , inscrito no CPF/CNPJ sob o nº{' '}
              <strong className="font-semibold">
                {data.clientDocument || '________________________'}
              </strong>
              , no valor total de{' '}
              <strong className="font-semibold uppercase">
                {numeroPorExtenso(data.amount) || '________________________________'}
              </strong>
              , referente à prestação dos seguintes serviços/produtos:{' '}
              <strong className="font-semibold">
                {data.description ||
                  '________________________________________________________________'}
              </strong>
              . Este orçamento tem validade de 15 dias a partir da data de emissão.
            </p>
          )}

          {documentType === 'service_order' && (
            <p>
              Fica autorizada a execução dos serviços especificados como:{' '}
              <strong className="font-semibold">
                {data.description ||
                  '________________________________________________________________'}
              </strong>
              , solicitados pelo cliente{' '}
              <strong className="font-semibold uppercase">
                {data.clientName || '________________________________________'}
              </strong>
              , inscrito no CPF/CNPJ sob o nº{' '}
              <strong className="font-semibold">
                {data.clientDocument || '________________________'}
              </strong>
              , pelo valor acordado de{' '}
              <strong className="font-semibold uppercase">
                {numeroPorExtenso(data.amount) || '________________________________'}
              </strong>
              .
            </p>
          )}

          {documentType !== 'promissory' && documentType !== 'budget' && (
            <p>
              Para maior clareza e validade, firmo(amos) o presente {documentTitle.toLowerCase()}.
            </p>
          )}
          {documentType === 'budget' && <p>Aguardamos aprovação para início dos trabalhos.</p>}
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
