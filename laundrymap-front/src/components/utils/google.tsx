import { useGoogleLogin } from "@react-oauth/google"
import GoogleButton from "../ui/GoogleButton"

export default function GoogleLoginButton({ onSuccess }: { onSuccess?: () => void }) {   
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetch("http://localhost:8080/api/v1/utilisateur/inscription/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenResponse.code })
      })
      .then(r => r.json())
      .then(data => {
        localStorage.setItem("jwt", data.token)
        onSuccess && onSuccess() 
      })
    },
    flow: "auth-code"
  })

  return (
    <GoogleButton onClick={() => login()} />
  )
}
