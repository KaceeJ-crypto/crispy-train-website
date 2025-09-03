// backend/scriptTemplates.js
export const LANGS = ["python", "go"];

export const TEMPLATES = [
  {
    id: "hello",
    label: "Hello World",
    langs: {
      python: `print("Hello, World!")`,
      go: `package main\nimport "fmt"\nfunc main() { fmt.Println("Hello, World!") }`,
    }
  },
  {
    id: "http-client",
    label: "HTTP Client",
    langs: {
      python: `import requests\nr = requests.get("https://example.com")\nprint(r.text)`,
      go: `package main\nimport("fmt";"net/http";"io/ioutil")\nfunc main(){res,_:=http.Get("https://example.com");body,_:=ioutil.ReadAll(res.Body);fmt.Println(string(body))}`,
    }
  }
];
