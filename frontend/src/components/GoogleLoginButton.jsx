

export default function GoogleLoginButton() {
  async function handleGoogleLogin() {
    try {
      // fetchamo podatke iz bekenda
      const res = await fetch("http://127.0.0.1:8000/api/auth/google/login-url/", {
        credentials: "include", // session cookie
      });

      if (!res.ok) throw new Error("Failed to get Google login URL.");

      // bekend vraca json file sa urlo-om
      const data = await res.json();

      // otvaramo URL i preusmjeravanje na google
      window.location.href = data.url;
    } catch (err) {
      console.error("Google login error:", err);
      alert("Something went wrong while connecting to Google.");
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        backgroundColor: "#4285F4",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Sign in with Google
    </button>
  );
}
