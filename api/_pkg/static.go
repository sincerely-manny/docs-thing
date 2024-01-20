package _pgk

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

func GetStatic(url string) string {
	s := strings.Split(url, "/")
	var filename string
	if len(s) > 0 {
		filename = s[len(s)-1]
	} else {
		panic("url is empty")
	}
	newFile, err := os.Create("/tmp/" + filename)
	if err != nil {
		panic(err)
	}
	defer newFile.Close()

	// Download the file from the URL and save it to the new file.
	fontresp, err := http.Get(os.Getenv("BASE_URL") + "/" + url)
	if err != nil {
		panic(err)
	}
	defer fontresp.Body.Close()
	if _, err := io.Copy(newFile, fontresp.Body); err != nil {
		panic(err)
	}
	return fmt.Sprintf("/tmp/%s", filename)
}
