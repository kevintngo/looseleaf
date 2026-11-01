"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field } from "@/blocks/login/fields"
import { Hint } from "./parts/hint"

const schema = z.object({ email: z.email() })
type Values = z.infer<typeof schema>

export function LoginBlock({ onSubmit }: { onSubmit?: (email: string) => void }) {
  const { register, handleSubmit } = useForm<Values>({ resolver: zodResolver(schema) })
  return (
    <Card className="w-80">
      <CardHeader>
        <h2 className="font-script text-2xl">Welcome back</h2>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit((v) => onSubmit?.(v.email))}>
          <Field label="Email" type="email" {...register("email")} />
          <Button type="submit">Sign in</Button>
          <Hint>we never share your address</Hint>
        </form>
      </CardContent>
    </Card>
  )
}
