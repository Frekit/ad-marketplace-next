"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

type Conversation = {
  id: string
  project_id: string
  participant_ids: string[]
  last_message_at: string
  created_at: string
}

type Project = {
  id: string
  title: string
  description: string
  skills_required: string[]
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      const id = resolvedParams?.id

      if (id) {
        await fetchConversation(id)
        // Poll for new messages
        const interval = setInterval(() => {
          fetchMessages(id)
        }, 2000)

        return () => clearInterval(interval)
      } else {
        setLoading(false)
      }
    }
    resolveParams()
  }, [params])

  const fetchConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setConversation(data)

        // Fetch project details
        if (data.project_id) {
          try {
            const projRes = await fetch(`/api/projects/${data.project_id}`)
            if (projRes.ok) {
              const projData = await projRes.json()
              setProject(projData)
            }
          } catch (err) {
            console.error('Error fetching project:', err)
          }
        }

        await fetchMessages(id)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la conversación"
        })
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar la conversación"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return

    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
      })

      if (res.ok) {
        setNewMessage("")
        await fetchMessages(conversation.id)
        toast({
          variant: "success",
          title: "Éxito",
          description: "Mensaje enviado"
        })
      } else {
        const data = await res.json()
        throw new Error(data.error || "Error al enviar mensaje")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al enviar mensaje"
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <FreelancerLayout>
        <div className="p-8 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
        </div>
      </FreelancerLayout>
    )
  }

  if (!conversation) {
    return (
      <FreelancerLayout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-red-600 mb-4">Conversación no encontrada</p>
                <Button onClick={() => router.back()}>Volver</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </FreelancerLayout>
    )
  }

  return (
    <FreelancerLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Back Link */}
          <Link href="/freelancer/proposals" className="text-[#0F4C5C] hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver a propuestas
          </Link>

          {/* Conversation Header */}
          <Card>
            <CardHeader>
              <CardTitle>Negociación</CardTitle>
            </CardHeader>
          </Card>

          {/* Messages */}
          <Card className="min-h-96 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay mensajes aún</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex mb-4"
                  >
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-gray-700">{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-[#0F4C5C] hover:bg-[#0D3A48]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </FreelancerLayout>
  )
}
