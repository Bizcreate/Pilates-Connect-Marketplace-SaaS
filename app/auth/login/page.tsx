import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { loginAction } from "./actions"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { email?: string; message?: string }
}) {
  const email = searchParams.email ? decodeURIComponent(searchParams.email) : ""
  const successMessage = searchParams.message ? decodeURIComponent(searchParams.message) : null

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Pilates Connect account</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAction}>
              <div className="flex flex-col gap-6">
                {successMessage && (
                  <div className="rounded-md bg-green-50 p-3">
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    defaultValue={email}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
