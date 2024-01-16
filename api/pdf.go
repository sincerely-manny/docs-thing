package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/col"
	mImage "github.com/johnfercher/maroto/v2/pkg/components/image"
	"github.com/johnfercher/maroto/v2/pkg/components/line"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/border"
	"github.com/johnfercher/maroto/v2/pkg/consts/extension"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/consts/orientation"
	"github.com/johnfercher/maroto/v2/pkg/consts/pagesize"
	"github.com/johnfercher/maroto/v2/pkg/props"
	"github.com/johnfercher/maroto/v2/pkg/repository"
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

func localPath(path string) string {
	return fmt.Sprintf("%s/api/assets/%s", os.Getenv("PWD"), path)
}

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
	resp, err := http.Get(os.Getenv("BASE_URL") + "/json/invoice?invoiceId=" + invoiceId)
	if err != nil {
		panic(err)
	}
	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Error fetching invoice data", http.StatusBadRequest)
		return
	}

	var invoice Invoice
	if err := json.NewDecoder(resp.Body).Decode(&invoice); err != nil {
		http.Error(w, "Error decoding JSON", http.StatusBadRequest)
		return
	}
	defer resp.Body.Close()

	customFonts, err := repository.New().
		AddUTF8Font("PlayfairDisplay", fontstyle.Normal, localPath("fonts/PlayfairDisplay/PlayfairDisplay-Regular.ttf")).
		AddUTF8Font("PlayfairDisplay", fontstyle.Bold, localPath("fonts/PlayfairDisplay/PlayfairDisplay-Bold.ttf")).
		AddUTF8Font("PlayfairDisplay", fontstyle.Italic, localPath("fonts/PlayfairDisplay/PlayfairDisplay-Italic.ttf")).
		AddUTF8Font("PlayfairDisplay", fontstyle.BoldItalic, localPath("fonts/PlayfairDisplay/PlayfairDisplay-BoldItalic.ttf")).
		Load()
	if err != nil {
		panic(err)
	}

	cfg := config.
		NewBuilder().
		WithCustomFonts(customFonts).
		WithDefaultFont(
			&props.Font{
				Family: "PlayfairDisplay",
				Style:  fontstyle.Normal,
				Size:   10,
			},
		).
		WithOrientation(orientation.Vertical).
		WithPageSize(pagesize.A4).
		WithMargins(15, 20, 15).
		Build()

	doc := maroto.New(cfg)

	file, err := os.Open(localPath("img/logo.png"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	img, _, err := image.Decode(file)
	if err != nil {
		panic(err)
	}
	buf := new(bytes.Buffer)
	err = png.Encode(buf, img)
	if err != nil {
		panic(err)
	}
	doc.AddRow(35,
		mImage.NewFromBytesCol(4, buf.Bytes(), extension.Png, props.Rect{
			Left:    0,
			Top:     0,
			Percent: 80,
		}),
		col.New(1),
		text.NewCol(3, "Коллегия Адвокатов Санкт-Петербурга", props.Text{
			Align:           align.Left,
			Style:           fontstyle.Italic,
			Size:            14,
			VerticalPadding: 2.5,
		},
		),
		col.New(4).Add(
			text.New("Бизнес-коллегия", props.Text{
				Align: align.Right,
				Style: fontstyle.Italic,
				Size:  18,
			}),
			text.New("«АСТЭР»", props.Text{
				Align: align.Right,
				Style: fontstyle.Italic,
				Size:  32,
				Top:   8.5,
			}),
		),
	)
	doc.AddRow(10,
		text.NewCol(12, "Поставщик: Коллегия адвокатов Санкт-Петербурга «Бизнес-коллегия «АСТЭР»"),
	)
	doc.AddRow(5,
		col.New(7).Add(
			text.New("191186, Санкт-Петербург, Невский пр., д. 30, оф. 6.11"),
		),
		col.New(5).Add(
			text.New("ИНН:", props.Text{Style: fontstyle.Bold}),
			text.New("7841000153", props.Text{Left: 11}),
			text.New("КПП:", props.Text{Style: fontstyle.Bold, Left: 32}),
			text.New("784101001", props.Text{Left: 43}),
		),
	)
	doc.AddRow(5,
		col.New(7).Add(
			text.New("Центральное ОСБ № 1991/0786", props.Text{Style: fontstyle.Bold}),
		),
		col.New(5).Add(
			text.New("р/с:", props.Text{Style: fontstyle.Bold}),
			text.New("40703810555230109434", props.Text{Left: 8}),
		),
	)
	doc.AddRow(5,
		col.New(7).Add(
			text.New("Северо-Западный банк ПАО Сбербанк", props.Text{Style: fontstyle.Bold}),
		),
		col.New(5).Add(
			text.New("к/с:", props.Text{Style: fontstyle.Bold}),
			text.New("30101810500000000653", props.Text{Left: 8}),
			text.New("БИК:", props.Text{Style: fontstyle.Bold, Left: 48}),
			text.New("044030653", props.Text{Left: 58}),
		),
	)
	doc.AddRow(3)
	doc.AddRow(1,
		line.NewCol(12, props.Line{
			SizePercent: 100,
		}),
	)
	doc.AddRow(1)
	doc.AddRow(5,
		text.NewCol(12, "Отправитель он же"),
	)
	doc.AddRow(5,
		text.NewCol(12, "Получатель он же"),
	)
	doc.AddRow(2)
	doc.AddRow(1,
		line.NewCol(12, props.Line{
			SizePercent: 100,
		}),
	)
	doc.AddRow(10)
	doc.AddRow(4, text.NewCol(
		12,
		"СЧЕТ № "+invoice.Number,
		props.Text{
			Align: align.Center,
			Style: fontstyle.Bold,
		},
	))
	doc.AddRow(4, text.NewCol(
		12,
		invoice.DateString,
		props.Text{
			Align: align.Center,
			Style: fontstyle.Bold,
		},
	))
	doc.AddRow(5)

	doc.AddRow(20,
		col.New(8).Add(
			text.New("Плательщик:", props.Text{
				Left:  2,
				Top:   2,
				Right: 2,
				Style: fontstyle.Bold,
			}),
			text.New(invoice.Client, props.Text{
				Left:  2,
				Top:   7,
				Right: 2,
			}),
		).WithStyle(&props.Cell{
			BorderColor: &props.BlackColor,
			BorderType:  border.Full,
		}),
		col.New(4).Add(
			text.New("Всего:", props.Text{
				Left:  2,
				Top:   2,
				Right: 2,
				Style: fontstyle.Bold,
			}),
			text.New(invoice.TotalFormatted, props.Text{
				Left:  2,
				Top:   7,
				Right: 2,
			}),
		).WithStyle(&props.Cell{
			BorderColor: &props.BlackColor,
			BorderType:  border.Full,
		}),
	)

	doc.AddRow(10)

	doc.AddRow(5,
		text.NewCol(12, "Дополнение:"),
	)
	doc.AddRow(5)
	doc.AddRow(5,
		text.NewCol(
			6,
			"Наименование",
			props.Text{
				Style: fontstyle.Bold,
				Left:  2,
				Right: 2,
			}).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		text.NewCol(
			2,
			"Кол-во",
			props.Text{
				Style: fontstyle.Bold,
				Left:  2,
				Right: 2,
			}).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		text.NewCol(
			2,
			"Цена",
			props.Text{
				Style: fontstyle.Bold,
				Left:  2,
				Right: 2,
			}).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		text.NewCol(
			2,
			"Сумма",
			props.Text{
				Style: fontstyle.Bold,
				Left:  2,
				Right: 2,
			}).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
	)

	for _, v := range invoice.Services {
		// TODO: dynamic line height
		doc.AddRow(5,
			text.NewCol(
				6,
				v.Title,
				props.Text{
					Left:  2,
					Right: 2,
				}).WithStyle(
				&props.Cell{
					BorderType: border.Full,
				},
			),
			text.NewCol(
				2,
				strconv.Itoa(v.Amount),
				props.Text{
					Left:  2,
					Right: 2,
				}).WithStyle(
				&props.Cell{
					BorderType: border.Full,
				},
			),
			text.NewCol(
				2,
				v.PriceFormatted,
				props.Text{
					Left:  2,
					Right: 2,
				}).WithStyle(
				&props.Cell{
					BorderType: border.Full,
				},
			),
			text.NewCol(
				2,
				v.TotalFormatted,
				props.Text{
					Left:  2,
					Right: 2,
				}).WithStyle(
				&props.Cell{
					BorderType: border.Full,
				},
			),
		)
	}

	doc.AddRow(5,
		col.New(6).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
	)

	doc.AddRow(5,
		text.NewCol(
			6,
			"НДС не облагается",
			props.Text{
				Left:  2,
				Right: 2,
				Style: fontstyle.Bold,
			}).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
	)
	doc.AddRow(5,
		text.NewCol(
			6,
			"Итого к оплате:",
			props.Text{
				Left:  2,
				Right: 2,
				Style: fontstyle.Bold,
			}).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		col.New(2).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
		text.NewCol(
			2,
			invoice.TotalFormatted,
			props.Text{
				Left:  2,
				Right: 2,
				Style: fontstyle.Bold,
			}).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
	)

	doc.AddRow(5,
		text.NewCol(
			12,
			invoice.TotalWords,
			props.Text{
				Align: align.Center,
				Style: fontstyle.Italic,
				Size:  8,
				Top:   1,
			},
		).WithStyle(
			&props.Cell{
				BorderType: border.Full,
			},
		),
	)

	doc.AddRow(20)

	doc.AddRow(4,
		text.NewCol(7,
			"Председатель коллегии",
			props.Text{Align: align.Right},
		),
		col.New(3),
		text.NewCol(2,
			"/ Воробьева И.Б. /",
		),
	)
	doc.AddRow(0,
		col.New(7),
		line.NewCol(3, props.Line{
			SizePercent: 100,
		}),
	)
	doc.AddRow(5,
		col.New(7),
		text.NewCol(3, "м.п.", props.Text{Align: align.Center, Size: 6}),
	)

	genrated, err := doc.Generate()
	if err != nil {
		return
	}
	bytes := genrated.GetBytes()

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.pdf", invoice.Number))
	w.Write(bytes)
	return
}
