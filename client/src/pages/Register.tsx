import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

type RegisterResponse = {
  success: boolean;
  message: string;

  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

const API_URL =
  "http://localhost:5000/api";

function Register() {
  const navigate =
    useNavigate();

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setMessage("");
      setIsLoading(true);

      try {
        const response =
          await fetch(
            `${API_URL}/auth/register`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    name:
                      name.trim(),
                    email:
                      email.trim(),
                    password,
                  }
                ),
            }
          );

        const data =
          (await response.json()) as RegisterResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          setMessage(
            data.message ||
              "Registration failed"
          );

          return;
        }

        navigate(
          "/login"
        );
      } catch (error) {
        console.error(
          "Registration request failed:",
          error
        );

        setMessage(
          "Could not connect to the server"
        );
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <p className="auth-badge">
            SupportAI
          </p>

          <h1>
            Create your account
          </h1>

          <p>
            Register to start
            managing customer
            support tickets.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >
          <label htmlFor="name">
            Full name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(
              event
            ) =>
              setName(
                event.target
                  .value
              )
            }
            autoComplete="name"
            required
          />

          <label htmlFor="email">
            Email address
          </label>

          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(
              event
            ) =>
              setEmail(
                event.target
                  .value
              )
            }
            autoComplete="email"
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(
              event
            ) =>
              setPassword(
                event.target
                  .value
              )
            }
            autoComplete="new-password"
            minLength={8}
            required
          />

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={
              isLoading
            }
          >
            {isLoading
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an
          account?{" "}

          <Link to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;