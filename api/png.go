package handler

import (
	"fmt"
	"net/http"
	"strconv"

	utils "web/pdf-to-img-micro/_pkg"

	"github.com/gen2brain/go-fitz"
)

func HandlerPng(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	invoiceId := r.URL.Query().Get("invoice_id")
	if invoiceId == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ppi := r.URL.Query().Get("ppi")
	if ppi == "" {
		ppi = "72"
	}
	ppiInt, err := strconv.ParseFloat(ppi, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	invoiceBytes, err := utils.InvoicePdf(invoiceId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	doc, err := fitz.NewFromMemory(invoiceBytes)
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
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=invoice_%s.pdf", invoiceId))
	w.WriteHeader(http.StatusOK)
	w.Write(pngBytes)
}
