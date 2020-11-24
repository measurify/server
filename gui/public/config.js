export default {
  name: "Measurify GUI",
  baseUrl: "https://localhost/v1",
  loginUrl: "/login",
  unauthorizedRedirectUrl: "/#/login",
  pages: [ 
    {
      name: "Things",
      id: "things",
      description: "",
      methods: {
        getAll: {
          label: "Things",
          dataPath: "docs",
          url: "/things",
          display: { type: "cards"},
          pagination: { type: "buttons", source: "query", params: { page: { name: "page" } }, fields: { total: { dataPath: "totalDocs" } } },
          fields: [
            { name: "picture", type: "image", label: "Immagine" },
            { name: "_id", type: "text", label: "Matricola" },
            { name: "name", type: "text", label: "Nome" },
            { name: "surname", type: "text", label: "Cognome" },
            { name: "link", type: "url", label: "Rubrica" }
          ],
          queryParams: [
            { name: "info", type: "text", hidden: false},
            { name: "role", type: "text", value: "Professore Ordinario", hidden: true }
          ]
        },
        customActions: [
          {
            name:"Send Email",
            url: "/character/:id/sendEmail",
            actualMethod: "post",
            icon: "envelope",
            fields: [
              {
                name: "id",
                type: "text",
                label: "ID",
                readonly: true
              },
              {
                name: "title",
                type: "text",
                label: "Email Title",
                required: true
              },
              {
                name: "body",
                type: "text",
                label: "Email Body",
                required: true
              }
            ]
          },
          {
            name:"Disable Character",
            url: "/character/:id/disable",
            actualMethod: "post",
            icon: "ban",
            fields: [
              {
                name: "id",
                type: "text",
                label: "Contact ID",
                readonly: true
              }
            ]
          }
        ]
      }
    }
  ]
}
