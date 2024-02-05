package handler

import (
	"fmt"
	"net/http"
	utils "web/pdf-to-img-micro/_pkg"
)

func HandlerPdf(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	invoiceId := r.URL.Query().Get("invoiceId")
	if invoiceId == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	bytes, err := utils.InvoicePdf(invoiceId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=invoice_%s.pdf", invoiceId))
	w.Write(bytes)
}
