# 📧 Email Service Application

A full-stack email sending service with a beautiful React frontend and robust Go backend. Send emails through SMTP with a modern, user-friendly interface.

![Go Version](https://img.shields.io/badge/go-%3E%3D1.19-blue.svg)
![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue.svg)

## ✨ Features

### Frontend
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 📊 **Email History** - Track all sent emails with detailed logs
- 🔍 **Search & Filter** - Quickly find emails in your history
- 📈 **Statistics Dashboard** - View success/failure rates at a glance
- 💾 **Export Functionality** - Download email history as JSON
- ✅ **Real-time Validation** - Character counters and form validation
- 📱 **Responsive Design** - Works seamlessly on all devices

### Backend
- 🚀 **Fast & Efficient** - Built with Go for optimal performance
- 🔒 **Secure** - Context-aware SMTP with TLS/STARTTLS support
- ⏱️ **Timeout Protection** - Built-in request timeouts
- 🌐 **CORS Enabled** - Ready for cross-origin requests
- 📝 **Comprehensive Logging** - Detailed error tracking
- ✉️ **Gmail Support** - Optimized for Gmail SMTP

## 🏗️ Architecture

```
├── backend/          # Go SMTP service
│   └── main.go
├── frontend/         # React application
│   ├── App.tsx
│   └── App-Enhanced.tsx
└── README.md
```

## 📋 Prerequisites

### Backend
- Go 1.19 or higher
- Gmail account with App Password enabled

### Frontend
- Node.js 16+ and npm/yarn
- Modern web browser

## 🚀 Quick Start

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/email-service.git
cd email-service/backend
```

2. **Install dependencies**
```bash
go mod init email-service
go get github.com/rs/cors
```

3. **Configure environment variables**
```bash
# Create a .env file or export variables
export SMTP_USERNAME="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
export SMTP_FROM="your-email@gmail.com"
```

4. **Get Gmail App Password**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Enable 2-Step Verification
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password as `SMTP_PASSWORD`

5. **Run the server**
```bash
go run main.go
```

The server will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

The app will open at `http://localhost:5173` (or your configured port)

## 📡 API Documentation

### Base URL
```
http://localhost:8080
```

### Endpoints

#### POST `/send`
Send an email through SMTP.

**Request Body:**
```json
{
  "email": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email body content"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `subject`: Required, max 25 characters
- `body`: Required, max 1000 characters

**Success Response (200 OK):**
```json
{
  "status": "sent"
}
```

**Error Response (400/502):**
```json
{
  "error": "error message"
}
```

#### POST `/receive`
Test endpoint for receiving and logging messages.

**Request Body:**
```json
{
  "email": "test@example.com",
  "subject": "Test",
  "body": "Test message"
}
```

**Response (200 OK):**
```json
{
  "status": "received"
}
```

## 🧪 Testing

### Using cURL

**Send an email:**
```bash
curl -X POST http://localhost:8080/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recipient@example.com",
    "subject": "Hello",
    "body": "This is a test email"
  }'
```

**Test receive endpoint:**
```bash
curl -X POST http://localhost:8080/receive \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "subject": "Test",
    "body": "Test message"
  }'
```

### Using the Web Interface

1. Open the React app in your browser
2. Fill in the recipient email, subject, and message
3. Click "Send Email"
4. View the result in the email history

## 🎨 Frontend Versions

### Standard Version (`App.tsx`)
A clean, straightforward interface with:
- Email sending form
- Complete email history
- Status indicators
- Character counters

### Enhanced Version (`App-Enhanced.tsx`)
Advanced features including:
- Statistics dashboard
- Search functionality
- Expandable log cards
- Export to JSON
- Improved animations

Choose the version that best fits your needs by renaming the desired file to `App.tsx`.

## 🔧 Configuration

### Backend Configuration

**Environment Variables:**
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SMTP_USERNAME` | Your Gmail address | Yes | - |
| `SMTP_PASSWORD` | Gmail app password | Yes | - |
| `SMTP_FROM` | From email address | Yes | - |

**Server Configuration:**
- **Port**: 8080 (configurable in `main.go`)
- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 587
- **Timeout**: 10 seconds

### Frontend Configuration

Update the API URL in the fetch calls if your backend runs on a different port:
```typescript
const res = await fetch("http://localhost:8080/send", {
  // ...
});
```

## 🛡️ Security Considerations

### Production Checklist

- [ ] **Never commit credentials** to version control
- [ ] Use environment variables for all sensitive data
- [ ] Implement rate limiting to prevent abuse
- [ ] Restrict CORS origins (change from `*` to specific domains)
- [ ] Add authentication/authorization
- [ ] Use HTTPS in production
- [ ] Implement request validation and sanitization
- [ ] Add logging and monitoring
- [ ] Set up proper error handling
- [ ] Use a secrets management system

### Gmail Security

- Always use App Passwords, never your actual Gmail password
- Enable 2-Step Verification
- Regularly rotate app passwords
- Monitor for unauthorized access

## 📊 Project Structure

```
email-service/
├── backend/
│   ├── main.go                 # Main server file
│   ├── go.mod                  # Go dependencies
│   └── go.sum                  # Dependency checksums
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Standard version
│   │   ├── App-Enhanced.tsx   # Enhanced version
│   │   └── styles.css         # Additional styles
│   ├── package.json           # Node dependencies
│   └── tsconfig.json          # TypeScript config
└── README.md                  # This file
```

## 🐛 Troubleshooting

### Backend Issues

**Authentication Failed**
- Verify you're using an App Password, not your regular Gmail password
- Ensure 2-Step Verification is enabled
- Check that the email address matches the one that generated the app password

**Connection Timeout**
- Check firewall settings
- Ensure port 587 is not blocked
- Verify internet connection
- Check SMTP server status

**Invalid Credentials**
- Double-check the app password (no spaces)
- Verify the username is your full Gmail address
- Ensure environment variables are properly set

### Frontend Issues

**CORS Errors**
- Ensure backend server is running
- Check CORS configuration in `main.go`
- Verify the fetch URL matches your backend address

**Email Not Sending**
- Check browser console for errors
- Verify all form fields are filled
- Ensure character limits are not exceeded
- Check network tab for API response

## 🚢 Deployment

### Backend Deployment

**Using Docker:**
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]
```

**Using a VPS:**
```bash
# Build the binary
go build -o email-service main.go

# Run with systemd or supervisor
./email-service
```

### Frontend Deployment

**Build for production:**
```bash
npm run build
# or
yarn build
```

Deploy the `dist` folder to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 📈 Performance

- **Backend**: Handles concurrent requests with Go goroutines
- **Frontend**: Optimized React components with proper state management
- **Response Time**: < 100ms for API responses (excluding SMTP latency)
- **Email Delivery**: 2-5 seconds via Gmail SMTP

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Go](https://golang.org/) - Backend language
- [React](https://reactjs.org/) - Frontend framework
- [rs/cors](https://github.com/rs/cors) - CORS middleware
- Gmail SMTP - Email delivery service

## 📧 Contact

Mahmoud shokr - [@Linkedin]([https://linkedin.com/mahmoud-shokr12](https://github.com/shokr12/Email_sender)) - mshokr1dhdj@gmail.com

Project Link: ([https://github.com/shokr12/Email_sender](https://github.com/shokr12/Email_sender))

---

**Made with ❤️ by shokr**
