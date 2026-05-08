import { Construction } from 'lucide-react'

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in p-8 mt-12">
      <div className="bg-blue-50 text-blue-600 p-6 rounded-full">
        <Construction className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Página em Construção</h1>
      <p className="text-lg text-slate-500 max-w-lg">
        Estamos trabalhando nesta funcionalidade com base na estrutura do novo sistema. Em breve ela
        estará disponível para você utilizar!
      </p>
    </div>
  )
}
