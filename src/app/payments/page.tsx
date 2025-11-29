"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, CreditCard } from "lucide-react"

export default function PaymentsPage() {
    return (
        <FreelancerLayout>
            <div className="p-8 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Facturas y pagos</h1>

                    <Tabs defaultValue="invoices" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="invoices">Mis facturas</TabsTrigger>
                            <TabsTrigger value="payment-methods">Mis medios de pago</TabsTrigger>
                        </TabsList>

                        <TabsContent value="invoices">
                            <Card className="p-12">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="mb-6">
                                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                                            <FileText className="h-12 w-12 text-gray-400" />
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Mis facturas
                                    </h2>
                                    <p className="text-gray-600 max-w-md mb-4">
                                        Todas las facturas que emitas a través de Malt aparecerán aquí. Podrás descargarlas en formato PDF y hacer un seguimiento de su estado de pago.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Aún no tienes facturas
                                    </p>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payment-methods">
                            <Card className="p-12">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="mb-6">
                                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                                            <CreditCard className="h-12 w-12 text-gray-400" />
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Añade un método de pago
                                    </h2>
                                    <p className="text-gray-600 max-w-md mb-6">
                                        Para recibir tus pagos, necesitas añadir una cuenta bancaria. Tus datos están seguros y encriptados.
                                    </p>
                                    <Button className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white">
                                        Añadir cuenta bancaria
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </FreelancerLayout>
    )
}
