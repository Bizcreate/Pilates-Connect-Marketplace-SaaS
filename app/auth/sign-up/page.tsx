"use client"

import { Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Pilates Connect</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Join Pilates Connect</CardTitle>
            <CardDescription>Choose how you'd like to sign up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/sign-up/instructor" className="block">
              <Button variant="outline" size="lg" className="w-full h-auto py-6 flex-col gap-2 bg-transparent">
                <span className="text-lg font-semibold">I'm an Instructor</span>
                <span className="text-sm text-muted-foreground font-normal">Find jobs and connect with studios</span>
              </Button>
            </Link>

            <Link href="/auth/sign-up/studio" className="block">
              <Button variant="outline" size="lg" className="w-full h-auto py-6 flex-col gap-2 bg-transparent">
                <span className="text-lg font-semibold">I'm a Studio</span>
                <span className="text-sm text-muted-foreground font-normal">Post jobs and hire instructors</span>
              </Button>
            </Link>

            <p className="text-sm text-center text-muted-foreground pt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
