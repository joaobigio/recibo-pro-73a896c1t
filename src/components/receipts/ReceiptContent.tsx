import { formatDate, maskCpfCnpj } from '@/lib/format'
import { numeroPorExtenso } from '@/lib/extenso'
import { ReceiptData } from './types'

interface ReceiptContentProps {
  data: ReceiptData
  documentType: string
  documentTitle: string
  className?: string
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

  return (
    <div className={className}>
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

      {documentType !== 'promissory' && documentType !== 'budget' && (
        <p>Para maior clareza e validade, firmo(amos) o presente {documentTitle.toLowerCase()}.</p>
      )}
      {documentType === 'budget' && <p>Aguardamos aprovação para início dos trabalhos.</p>}

      {data.observations && (
        <div className="mt-4 pt-4 border-t border-dashed">
          <p className="text-sm font-medium">Observações:</p>
          <p className="text-sm">{data.observations}</p>
        </div>
      )}

      {data.paymentMethods && data.paymentMethods.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium">
            Forma de Pagamento: {data.paymentMethods.map((m: any) => m.type).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
