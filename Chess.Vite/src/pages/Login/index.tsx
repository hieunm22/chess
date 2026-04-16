import { FormEvent, useState } from "react"
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	InputAdornment,
	IconButton,
	Link,
	Paper,
	Stack,
	Typography
} from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { TTextField } from "components/TranslationTag"

export default function LoginPage() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)
		setMessage(null)
		setLoading(true)

		try {
			// TODO: Replace with the real authentication endpoint and token/session handling.
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ username, password })
			})

			if (!response.ok) {
				throw new Error("Login failed. Please check your credentials.")
			}

			setMessage("Login request sent successfully.")
		} catch (submitError) {
			const submitMessage =
				submitError instanceof Error ? submitError.message : "Unexpected error while logging in."
			setError(submitMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
        width: "100%",
        justifyContent: "center",
			}}
		>
			<Paper elevation={4} sx={{ width: "100%", maxWidth: 420, p: 4, borderRadius: 3 }}>
				<Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
					<Typography variant="h5" component="h1" fontWeight={700}>
						Login
					</Typography>

					<TTextField
						label="User name"
            variant="standard"
						name="username"
						value={username}
						onChange={event => setUsername(event.target.value)}
						required
						fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="fas fa-user" />
                  </InputAdornment>
                )
              }
            }}
					/>

					<TTextField
            label="Password"
						name="password"
            variant="standard"
            placeholder="Password"
						type={showPassword ? "text" : "password"}
						value={password}
						onChange={event => setPassword(event.target.value)}
						required
						fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="fas fa-lock" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
					/>

					<Stack direction="row" justifyContent="space-between" spacing={2}>
						<Link component={RouterLink} to="/lost-password" underline="hover" variant="body2">
							Forgot password
						</Link>
						<Link component={RouterLink} to="/register" underline="hover" variant="body2">
							Register new account
						</Link>
					</Stack>

					{error && <Alert severity="error">{error}</Alert>}
					{message && <Alert severity="success">{message}</Alert>}

					<Button type="submit" variant="contained" disabled={loading} fullWidth size="large">
						{loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
					</Button>
				</Stack>
			</Paper>
		</Box>
	)
}
