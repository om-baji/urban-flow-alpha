import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useSession, useSignUp } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SignInForm({
  className,
  ...props
}: {
  className?: string;
}) {

  const { isLoaded, setActive, signUp } = useSignUp()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isPending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const navigate = useRouter()

  const { session } = useSession()

  useEffect(() => {
    if(session) {
      navigate.push("/home")
      toast( "Already logged in")
    }
  },[session,navigate])

  const handleSignUp = async (e : React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return <div>Loading...</div>

    try {
      await signUp.create({ emailAddress: email,username : name })

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      })

      setPending(true)
    } catch (error) {
      if (error instanceof Error) {
        console.log(JSON.stringify(error))
        setError(error.message)
      }
      setError(error instanceof Error ? error.message : String(error))
      console.log("Unknown error ocuured", error)
    }
  }

  const handleVerify = async () => {
    try {
      const response = await signUp?.attemptEmailAddressVerification({
        "code": code
      })

      if (response?.status !== "complete") {
        throw new Error("Something went wrong!")
      }

      if (response?.status === "complete") {
        if (setActive) {
          await setActive({ session: response.createdSessionId });
          navigate.push("/home")
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(JSON.stringify(error))
        setError(error.message)
      }
      setError(error instanceof Error ? error.message : String(error))
      console.log("Unknown error ocuured", error)
    }
  }

  const handleOauth = async () => {
    if (!isLoaded) return
    await signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: window.location.origin,
      redirectUrlComplete: `${window.location.origin}/home`
    })
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          {!isPending ? (<form className="p-6 md:p-8" onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Urban Flow account
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="example"
                  onChange={e => setName(e.target.value)}
                  required
                />

                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                disabled={isPending}
                type="submit" className="w-full">
                {isPending ? "Loading..." : "Sign up"}
              </Button>
              {error && (<Alert>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>)}

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">

                <Button
                  onClick={handleOauth}
                  variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>

              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/sign-in" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form> ) : (
            <form className="p-6 md:p-8" onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your Notes Native account
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="code">One Time Password</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="238XXX"
                    onChange={e => setCode(e.target.value)}
                    required
                  />
                </div>

                <Button
                  disabled={isPending}
                  onClick={handleVerify}
                  type="submit" className="w-full">
                  {isPending ? "Loading..." : "Verify Code"}
                </Button>

                {error && (<Alert>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>)}

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4">

                  <Button
                    onClick={handleOauth}
                    variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Login with Google</span>
                  </Button>

                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <a href="/sign-in" className="underline underline-offset-4">
                    Login
                  </a>
                </div>
              </div>
            </form>
          )}
          <div className="relative hidden bg-muted md:block">
            <img
              src="https://images.unsplash.com/photo-1734276221099-ba7f256b15e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDM4fGJvOGpRS1RhRTBZfHxlbnwwfHx8fHw%3D"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}