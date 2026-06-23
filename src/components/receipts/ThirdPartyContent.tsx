import { maskCpfCnpj } from '@/lib/format'
import { numeroPorExtenso } from '@/lib/extenso'
import { useAuth } from '@/hooks/use-auth'

export function ThirdPartyContent({ data, className }: { data: any; className?: string }) {
  const { profile } = useAuth()
  const issuerDoc = data.issuerDocument || profile?.document || ''
  const isCNPJ = issuerDoc.replace(/\D/g, '').length > 11
  const docTypeLabel = isCNPJ ? 'CNPJ' : 'CPF'

  return (
    <div className={className}>
      <p className="text-justify hyphens-auto">
        Recebi de{' '}
        <strong className="font-bold uppercase text-current">
          {data.issuerName || profile?.name || '________________________________________'}
        </strong>
        , inscrit{isCNPJ ? 'a' : 'o'} no{' '}
        <strong className="font-bold uppercase">{docTypeLabel}</strong> nº{' '}
        <strong className="font-bold uppercase text-current">
          {issuerDoc ? maskCpfCnpj(issuerDoc) : '________________________'}
        </strong>
        , a importância de{' '}
        <strong className="font-bold uppercase text-current">
          {numeroPorExtenso(data.amount) || '________________________________'}
        </strong>
        , referente {data.referencePrefix || 'à'}{' '}
        <strong className="font-bold uppercase text-current break-words">
          {data.description
            ? data.description.replace(/\s+/g, ' ')
            : '________________________________________________________________'}
        </strong>
        .
      </p>

      {(data.paymentMethod || data.paymentMethods?.length || data.clientPixKey) && (
        <p className="pt-2 text-left">
          {(data.paymentMethod || data.paymentMethods?.length) && (
            <>
              Pagamento via{' '}
              <strong className="font-bold uppercase text-current">
                {data.paymentMethods && data.paymentMethods.length > 0
                  ? data.paymentMethods.map((m: any) => m.type).join(', ')
                  : data.paymentMethod === 'outros' && data.paymentMethodDetails
                    ? data.paymentMethodDetails
                    : (
                        {
                          pix: 'PIX',
                          dinheiro: 'Dinheiro',
                          cartao_credito: 'Cartão de Crédito',
                          cartao_debito: 'Cartão de Débito',
                          transferencia: 'Transferência Bancária',
                          boleto: 'Boleto',
                          outros: 'Outros',
                        } as Record<string, string>
                      )[data.paymentMethod || ''] || data.paymentMethod}
              </strong>
            </>
          )}
          {data.clientPixKey &&
            (!data.paymentMethod ||
              data.paymentMethod === 'pix' ||
              data.paymentMethods?.some((m: any) => m.type.toLowerCase() === 'pix')) && (
              <>
                {data.paymentMethod || data.paymentMethods?.length ? ' - Chave (' : 'Chave PIX ('}
                {{
                  cpf: 'CPF',
                  cnpj: 'CNPJ',
                  email: 'E-mail',
                  phone: 'Telefone',
                  random: 'Aleatória',
                }[data.clientPixKeyType || ''] ||
                  data.clientPixKeyType ||
                  'Aleatória'}
                ): <strong className="font-bold uppercase text-current">{data.clientPixKey}</strong>
              </>
            )}
        </p>
      )}

      <p className="text-left">
        {data.dischargeText ||
          'Para maior clareza, firmo o presente recibo, conferindo plena, geral e irrevogável quitação pelo valor recebido, para nada mais reclamar ou exigir a qualquer título, seja presente ou futuro.'}
      </p>

      {data.observations && (
        <p className="pt-2 break-words [overflow-wrap:anywhere] text-left">
          <strong className="font-bold uppercase text-current">OBSERVAÇÃO:</strong>{' '}
          {data.observations.replace(/\s+/g, ' ')}
        </p>
      )}
    </div>
  )
}
