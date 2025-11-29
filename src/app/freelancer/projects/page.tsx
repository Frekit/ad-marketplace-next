"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"

export default function FreelancerProjectsPage() {
    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestionar proyectos</h1>

                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                                    <FolderOpen className="h-12 w-12 text-gray-400" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                ¡Sin proyectos, por ahora!
                            </h2>
                            <p className="text-gray-600 max-w-md mb-8">
                                Aquí podrás ver y gestionar tus proyectos con los clientes. Cuando recibas tu primera propuesta de proyecto o un cliente te contrate, aparecerá aquí.
                            </p>
                            <Button className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white">
                                Completar mi perfil
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </FreelancerLayout>
    )
}
