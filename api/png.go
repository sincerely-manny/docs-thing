package handler

import (
	"bytes"
	"io"
	"net/http"
	"os"
	"strconv"

	"github.com/gen2brain/go-fitz"
)

func HandlerPng(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	invoiceId := r.URL.Query().Get("invoiceId")
	if invoiceId == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ppi := r.URL.Query().Get("ppi")
	if ppi == "" {
		ppi = "72"
	}
	ppiInt, err := strconv.ParseFloat(ppi, 10)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	resp, err := http.Get(os.Getenv("VERCEL_URL") + "/invoice/pdf?invoiceId=" + invoiceId)
	if err != nil {
		panic(err)
	}
	content, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	doc, err := fitz.NewFromReader(bytes.NewBuffer(content))
	if err != nil {
		panic(err)
	}
	defer doc.Close()

	pngBytes, err := doc.ImagePNG(0, ppiInt)
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Content-Length", strconv.Itoa(len(pngBytes)))
	w.Header().Set("Cache-Control", "public, max-age=7776000")
	w.Header().Set("Content-Disposition", "inline; filename=\"invoice.png\"")
	w.WriteHeader(http.StatusOK)
	w.Write(pngBytes)
}
