package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"regexp"
	"time"

	"github.com/rs/cors"
)

type Message struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

func sendGmail(ctx context.Context, host string, port int, username, password, from, to, subject, body string) error {
	addr := fmt.Sprintf("%s:%d", host, port)
	d := net.Dialer{}
	conn, err := d.DialContext(ctx, "tcp", addr)
	if err != nil {
		return fmt.Errorf("dial smtp: %w", err)
	}

	c, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("new smtp client: %w", err)
	}
	defer c.Close()

	tlsCfg := &tls.Config{ServerName: host}
	if err := c.StartTLS(tlsCfg); err != nil {
		return fmt.Errorf("starttls: %w", err)
	}

	auth := smtp.PlainAuth("", username, password, host)
	if err := c.Auth(auth); err != nil {
		return fmt.Errorf("auth: %w", err)
	}

	if err := c.Mail(from); err != nil {
		return fmt.Errorf("mail from: %w", err)
	}

	if err := c.Rcpt(to); err != nil {
		return fmt.Errorf("rcpt to: %w", err)
	}

	w, err := c.Data()
	if err != nil {
		return fmt.Errorf("data: %w", err)
	}

	msg := []byte(
		"From: " + from + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=\"utf-8\"\r\n" +
			"\r\n" +
			body + "\r\n",
	)

	if _, err := w.Write(msg); err != nil {
		_ = w.Close()
		return fmt.Errorf("write: %w", err)
	}

	if err := w.Close(); err != nil {
		return fmt.Errorf("close data: %w", err)
	}

	return c.Quit()
}

func validateMessage(message Message) error {
	if message.Email == "" || message.Subject == "" || message.Body == "" {
		return errors.New("invalid message: email, subject, and body are required")
	}

	matched, _ := regexp.MatchString(
		`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
		message.Email,
	)
	if !matched {
		return errors.New("invalid email format")
	}

	if len(message.Subject) > 25 {
		return errors.New("invalid message: subject is too long")
	}

	if len(message.Body) > 1000 {
		return errors.New("invalid message: body is too long")
	}

	return nil
}

type MessageService struct {
	smtpHost string
	smtpPort int
	username string
	password string
	from     string
	timeout  time.Duration
}

func NewSMTPMessageService(host string, port int, username, password, from string) *MessageService {
	return &MessageService{
		smtpHost: host,
		smtpPort: port,
		username: username,
		password: password,
		from:     from,
		timeout:  10 * time.Second,
	}
}

func (s *MessageService) Send(ctx context.Context, message Message) error {
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	return sendGmail(ctx, s.smtpHost, s.smtpPort, s.username, s.password,
		s.from, message.Email, message.Subject, message.Body)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func SendMessageHandler(svc *MessageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}

		defer r.Body.Close()

		var message Message
		if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
			return
		}

		if err := validateMessage(message); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}

		if err := svc.Send(r.Context(), message); err != nil {
			log.Printf("SEND ERROR: %v\n", err)
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "failed to send email"})
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"status": "sent"})
	}
}

func ReceiveMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	defer r.Body.Close()

	var m Message
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	log.Printf("RECEIVED: %+v\n", m)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "received"})
}

func main() {
	smtpUsername := os.Getenv("SMTP_USERNAME")
	smtpPassword := os.Getenv("SMTP_PASSWORD")
	smtpFrom := os.Getenv("SMTP_FROM")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodOptions,
		},
		AllowedHeaders: []string{"*"},
	})

	svc := NewSMTPMessageService("smtp.gmail.com", 587, smtpUsername, smtpPassword, smtpFrom)

	mux := http.NewServeMux()
	mux.HandleFunc("/send", SendMessageHandler(svc))
	mux.HandleFunc("/receive", ReceiveMessage)

	handler := c.Handler(mux)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
