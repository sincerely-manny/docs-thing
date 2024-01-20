package _pgk

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"time"
)

type Invoice struct {
	Number         string    `json:"number"`
	Date           time.Time `json:"date"`
	DateString     string    `json:"dateString"`
	Client         string    `json:"client"`
	Total          int       `json:"total"`
	TotalFormatted string    `json:"totalFormatted"`
	TotalWords     string    `json:"totalWords"`
	Services       []struct {
		Title          string `json:"title"`
		Amount         int    `json:"amount"`
		Price          int    `json:"price"`
		PriceFormatted string `json:"priceFormatted"`
		Total          int    `json:"total"`
		TotalFormatted string `json:"totalFormatted"`
	} `json:"services"`
}

func GetInvoice(id string) (Invoice, error) {
	var invoice Invoice
	resp, err := http.Get("https://docs-thing.vercel.app/json/invoice?invoiceId=" + id)
	if err != nil {
		return invoice, err
	}
	if resp.StatusCode != http.StatusOK {
		log.Println("Error getting invoice")
		log.Println(resp.StatusCode)
		log.Println("http://" + os.Getenv("VERCEL_URL") + "/json/invoice?invoiceId=" + id)
		return invoice, errors.New("Error getting invoice")
	}

	if err := json.NewDecoder(resp.Body).Decode(&invoice); err != nil {
		return invoice, errors.New("Error decoding invoice")
	}
	defer resp.Body.Close()

	return invoice, nil
}
