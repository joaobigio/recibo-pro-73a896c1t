import { formatDate, maskCpfCnpj } from '@/lib/format'
import { numeroPorExtenso } from '@/lib/extenso'
import { ReceiptData } from './types'

interface ReceiptContentProps {
  data: ReceiptData
  documentType: string
  documentTitle: string
  className?: string
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function ReceiptContent({
  data,
  documentType,
  documentTitle,
  className = 'space-y-6 text-lg leading-loose text-justify',
}: ReceiptContentProps) {
  const addressParts = [
    data.clientStreet,
    data.clientNumber,
    data.clientNeighborhood,
    data.clientCity,
    data.clientState ? `- ${data.clientState}` : '',
    data.clientCep ? `CEP: ${data.clientCep}` : '',
  ]
    .filter(Boolean)
    .join(', ')
    .replace(/, -/g, ' -')
    .replace(/, CEP/g, ' - CEP')

  const hasAddress = addressParts.trim().length > 0

  const hasItems = data.items && data.items.length > 0

  return (
    <div className={className}>
      {data.documentNumber && (
        <div className="mb-4 text-right print:mb-2">
          <span className="font-bold text-sm bg-muted print:bg-transparent print:border print:border-gray-300 px-3 py-1 rounded-md">
            Nº {data.documentNumber}
          </span>
        </div>
      )}

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
            {data.description || '________________________________________________________________'}
          </strong>
          .
          {hasAddress && (
            <span>
              {' '}
              Pagador residente/sediado em <strong className="font-semibold">{addressParts}</strong>
              .
            </span>
          )}
          {data.clientPixKey && (
            <span>
              {' '}
              {data.clientPixKeyType ? (
                <>
                  Chave PIX do pagador (
                  {{
                    cpf: 'CPF',
                    cnpj: 'CNPJ',
                    email: 'E-mail',
                    phone: 'Telefone',
                    random: 'Aleatória',
                  }[data.clientPixKeyType] || data.clientPixKeyType}
                  ):
                </>
              ) : (
                'Chave PIX do pagador:'
              )}{' '}
              <strong className="font-semibold">{data.clientPixKey}</strong>.
            </span>
          )}
        </p>
      )}

      {(documentType === 'receipt' ||
        documentType === 'items' ||
        documentType === 'third_party' ||
        documentType === 'rent') && (
        <p>
          Recebi(emos) de{' '}
          <strong className="font-semibold uppercase">
            {data.clientName || '________________________________________'}
          </strong>
          , inscrito no CPF/CNPJ sob o nº{' '}
          <strong className="font-semibold">
            {data.clientDocument ? maskCpfCnpj(data.clientDocument) : '________________________'}
          </strong>
          {hasAddress && (
            <span>
              , residente/sediado em <strong className="font-semibold">{addressParts}</strong>
            </span>
          )}
          {data.clientPixKey && (
            <span>
              , com{' '}
              {data.clientPixKeyType ? (
                <>
                  Chave PIX (
                  {{
                    cpf: 'CPF',
                    cnpj: 'CNPJ',
                    email: 'E-mail',
                    phone: 'Telefone',
                    random: 'Aleatória',
                  }[data.clientPixKeyType] || data.clientPixKeyType}
                  )
                </>
              ) : (
                'Chave PIX'
              )}{' '}
              <strong className="font-semibold">{data.clientPixKey}</strong>
            </span>
          )}
          , a importância de{' '}
          <strong className="font-semibold uppercase">
            {numeroPorExtenso(data.amount) || '________________________________'}
          </strong>
          , referente {data.referencePrefix || 'a'}{' '}
          <strong className="font-semibold">
            {documentType === 'rent' ? 'aluguel do imóvel localizado em: ' : ''}
            {data.description || '________________________________________________________________'}
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
            {data.clientDocument ? maskCpfCnpj(data.clientDocument) : '________________________'}
          </strong>
          {hasAddress && (
            <span>
              , endereço: <strong className="font-semibold">{addressParts}</strong>
            </span>
          )}
          {data.clientPixKey && (
            <span>
              ,{' '}
              {data.clientPixKeyType ? (
                <>
                  Chave PIX (
                  {{
                    cpf: 'CPF',
                    cnpj: 'CNPJ',
                    email: 'E-mail',
                    phone: 'Telefone',
                    random: 'Aleatória',
                  }[data.clientPixKeyType] || data.clientPixKeyType}
                  ):
                </>
              ) : (
                'Chave PIX:'
              )}{' '}
              <strong className="font-semibold">{data.clientPixKey}</strong>
            </span>
          )}
          , no valor total de{' '}
          <strong className="font-semibold uppercase">
            {numeroPorExtenso(data.amount) || '________________________________'}
          </strong>
          , referente à prestação dos seguintes serviços/produtos:{' '}
          <strong className="font-semibold">
            {data.description || '________________________________________________________________'}
          </strong>
          . Este orçamento tem validade de 15 dias a partir da data de emissão.
        </p>
      )}

      {documentType === 'service_order' && (
        <p>
          Fica autorizada a execução dos serviços especificados como:{' '}
          <strong className="font-semibold">
            {data.description || '________________________________________________________________'}
          </strong>
          , solicitados pelo cliente{' '}
          <strong className="font-semibold uppercase">
            {data.clientName || '________________________________________'}
          </strong>
          , inscrito no CPF/CNPJ sob o nº{' '}
          <strong className="font-semibold">
            {data.clientDocument ? maskCpfCnpj(data.clientDocument) : '________________________'}
          </strong>
          {hasAddress && (
            <span>
              , endereço: <strong className="font-semibold">{addressParts}</strong>
            </span>
          )}
          {data.clientPixKey && (
            <span>
              ,{' '}
              {data.clientPixKeyType ? (
                <>
                  Chave PIX (
                  {{
                    cpf: 'CPF',
                    cnpj: 'CNPJ',
                    email: 'E-mail',
                    phone: 'Telefone',
                    random: 'Aleatória',
                  }[data.clientPixKeyType] || data.clientPixKeyType}
                  ):
                </>
              ) : (
                'Chave PIX:'
              )}{' '}
              <strong className="font-semibold">{data.clientPixKey}</strong>
            </span>
          )}
          , pelo valor acordado de{' '}
          <strong className="font-semibold uppercase">
            {numeroPorExtenso(data.amount) || '________________________________'}
          </strong>
          .
        </p>
      )}

      {hasItems && (
        <div className="my-6 print:my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-primary/20 print:border-gray-800">
                <th className="text-left py-2 font-semibold print:text-gray-800">Descrição</th>
                <th className="text-right py-2 font-semibold print:text-gray-800">Qtd</th>
                <th className="text-right py-2 font-semibold print:text-gray-800">V. Unitário</th>
                <th className="text-right py-2 font-semibold print:text-gray-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items!.map((item: any, i: number) => (
                <tr key={item.id || i} className="border-b border-muted print:border-gray-300">
                  <td className="py-2 text-left print:text-gray-800">{item.description || '-'}</td>
                  <td className="py-2 text-right print:text-gray-800">{item.quantity}</td>
                  <td className="py-2 text-right print:text-gray-800">
                    {formatMoney(item.unitPrice || 0)}
                  </td>
                  <td className="py-2 text-right print:text-gray-800">
                    {formatMoney((item.quantity || 0) * (item.unitPrice || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-1 text-sm print:text-gray-800">
              {data.discount ? (
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatMoney(data.subtotal || 0)}</span>
                </div>
              ) : null}
              {data.discount ? (
                <div className="flex justify-between text-red-600 print:text-gray-800">
                  <span>Desconto:</span>
                  <span>-{formatMoney(data.discount)}</span>
                </div>
              ) : null}
              {data.surcharge ? (
                <div className="flex justify-between text-blue-600 print:text-gray-800">
                  <span>Acréscimo:</span>
                  <span>+{formatMoney(data.surcharge)}</span>
                </div>
              ) : null}
              {data.discount || data.surcharge || hasItems ? (
                <div className="flex justify-between font-bold text-base pt-2 border-t print:border-gray-800 mt-2">
                  <span>Total:</span>
                  <span>{formatMoney(data.amount)}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {documentType !== 'promissory' && documentType !== 'budget' && (
        <p className="print:text-gray-800">
          Para maior clareza e validade, firmo(amos) o presente {documentTitle.toLowerCase()}.
        </p>
      )}
      {documentType === 'budget' && (
        <p className="print:text-gray-800">Aguardamos aprovação para início dos trabalhos.</p>
      )}

      {data.observations && (
        <div className="mt-6 pt-4 border-t border-dashed print:border-gray-400">
          <p className="text-sm font-semibold mb-1 print:text-gray-800">Observações:</p>
          <p className="text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere] print:text-gray-700">
            {data.observations}
          </p>
        </div>
      )}

      {data.paymentMethods && data.paymentMethods.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium print:text-gray-800">
            Forma de Pagamento: {data.paymentMethods.map((m: any) => m.type).join(', ')}
          </p>
        </div>
      )}
      {data.paymentMethod && (
        <div className="mt-4">
          <p className="text-sm font-medium print:text-gray-800">
            Forma de Pagamento:{' '}
            <span className="capitalize">{data.paymentMethod.replace('_', ' ')}</span>
            {data.paymentMethodDetails && ` - ${data.paymentMethodDetails}`}
          </p>
        </div>
      )}
    </div>
  )
}
