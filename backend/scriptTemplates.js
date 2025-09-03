// backend/scriptTemplates.js

// Supported languages
export const LANGS = ["python", "go"];

// Example templates
export const TEMPLATES = [
  {
    id: "scanner",
    name: "Port Scanner",
    description: "Simple port scanner",
    langs: {
      python: `
import socket, sys
target = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
for port in range(20, 1025):
    try:
        s = socket.socket()
        s.settimeout(0.5)
        s.connect((target, port))
        print(f"Port {port} open")
        s.close()
    except:
        pass
`,
      go: `
package main
import (
    "fmt"
    "net"
    "os"
    "strconv"
    "time"
)
func main() {
    target := "127.0.0.1"
    if len(os.Args) > 1 { target = os.Args[1] }
    for port := 20; port <= 1024; port++ {
        address := target + ":" + strconv.Itoa(port)
        conn, err := net.DialTimeout("tcp", address, 500*time.Millisecond)
        if err == nil {
            fmt.Println("Port", port, "open")
            conn.Close()
        }
    }
}
`,
    },
  },
  {
    id: "hello",
    name: "Hello World",
    description: "Minimal script template",
    langs: {
      python: `print("Hello, GhostLab!")`,
      go: `package main; import "fmt"; func main(){ fmt.Println("Hello, GhostLab!") }`,
    },
  },
  {
    id: "ghostlab",
    name: "GhostLab Starter",
    description: "Basic GhostLab template",
    langs: {
      python: `print("Welcome to GhostLab!")`,
      go: `package main; import "fmt"; func main(){ fmt.Println("Welcome to GhostLab!") }`,
    },
  },
];

// Create a lookup map for easier access
export const TEMPLATE_BY_ID = new Map(TEMPLATES.map(t => [t.id, t]));
