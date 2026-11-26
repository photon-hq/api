package photonapi

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"strings"
)

// UploadFile is a file to upload: the Body of an operation whose request is a
// multipart/related file upload (RFC 2387), such as UploadAttachment.
//
// The client sends it as a multipart/related body of two parts: a JSON part
// that describes the file ({"contentType":…,"filename":…,"sizeBytes":…}),
// then Data with ContentType as its media type. The boundary is derived from
// Data, so a retry with the same Idempotency-Key sends the same request. The
// client sets Content-Type (with the boundary) and Content-Length.
type UploadFile struct {
	// Data is the content of the file.
	Data []byte
	// ContentType is the media type of the file, such as "image/png".
	ContentType string
	// Filename is the name of the file, or "" for none.
	Filename string
}

type uploadMetadata struct {
	ContentType string `json:"contentType"`
	Filename    string `json:"filename,omitempty"`
	SizeBytes   int    `json:"sizeBytes"`
}

// encode returns the multipart/related body of the file and the request's
// Content-Type, which carries the boundary.
func (f *UploadFile) encode() ([]byte, string, error) {
	if strings.TrimSpace(f.ContentType) == "" {
		return nil, "", errors.New("the file has no content type")
	}
	if strings.ContainsAny(f.ContentType, "\r\n") {
		return nil, "", errors.New("the file's content type contains a line break")
	}
	var metadata bytes.Buffer
	encoder := json.NewEncoder(&metadata)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(uploadMetadata{ContentType: f.ContentType, Filename: f.Filename, SizeBytes: len(f.Data)}); err != nil {
		return nil, "", err
	}
	sum := sha256.Sum256(f.Data)
	boundary := "photon-" + hex.EncodeToString(sum[:16])
	var body bytes.Buffer
	body.Grow(metadata.Len() + len(f.Data) + len(f.ContentType) + 4*len(boundary) + 64)
	body.WriteString("--" + boundary + "\r\nContent-Type: application/json\r\n\r\n")
	body.Write(bytes.TrimSuffix(metadata.Bytes(), []byte("\n")))
	body.WriteString("\r\n--" + boundary + "\r\nContent-Type: " + f.ContentType + "\r\n\r\n")
	body.Write(f.Data)
	body.WriteString("\r\n--" + boundary + "--\r\n")
	return body.Bytes(), "multipart/related; boundary=" + boundary, nil
}
