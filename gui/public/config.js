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
          dataPath: "docs",
          label: "Things",
          url: "/things/",

          queryParams: [
            {
              name: "_id",
              value: "",
              type: "text",
              label: "ID"
            },
          ],

          display: {
            type: "cards",
          },
          fields: [
            {
              name: "_id",
              type: "text",
              label: "ID",
            },
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
            {
              name: "relations",
              type: "text",
              label: "Relations",
            },
            {
              name: "tags_pr",
              type: "text",
              label: "Tags",
            },
          ],
          
          //"dataTransform": item => Object.assign(item.tags_pr, item.tags === undefined ? item.tags_pr = "No tags" : item.tags_pr= item.tags.map() ),

          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" }}, //, limit : {name: "limit", type : "text"} 
            fields: { total: { dataPath: "totalDocs" } },
          },
        },
        getSingle: {
          url: "/things/:_id/",
          dataPath: "docs",
          queryParams: [],
          requestHeaders: {},
        },
        put: {
          url: "/things/:_id",
          fields: [
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
          ],
        },
        post: {
          url: "/things/",
          fields: [
            {
              name: "_id",
              type: "text",
              label: "ID",
            },
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
          ],
        },
        delete: {
          url: "/things/:_id",
        },
      },
    },

    {
      name: "Features",
      id: "features",
      description: "Manage features.",
      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/features",
          /*"queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],*/
          display: {
            type: "table",
          },
          fields: [
            {
              name: "_id",
              type: "text",
              label: "Id",
            },
            {
              name: "item",
              type: "text",
              label: "Items",
            },
          ],
          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" } },
            fields: { total: { dataPath: "totalDocs" } },
          },
        },
        getSingle: {
          url: "/features/:_id",
          queryParams: [],
          requestHeaders: {},
        },
        put: {
          url: "/features/:_id",
          fields: [
            {
              name: "name",
              label: "Name",
              type: "text",
            },
          ],
        },
        post: {
          url: "/features",
          fields: [
            {
              name: "name",
              label: "Name",
              type: "text",
            },
          ],
        },
        delete: {
          url: "/features/:_id",
        },
      },

      customActions: [
        {
          name: "Expand",
          url: "/things/:_id",
          dataPath: "items",
          actualMethod: "get",
          fields: [
            {
              name: "name",
              label: "Name",
              type: "text",
            },
            {
              name: "unit",
              label: "Unit",
              type: "text",
            },
            {
              name: "dimension",
              label: "Name",
              type: "text",
            },
          ],
        },
      ],
    },
  ],
};

/*
TESTING PART

//base page (working)

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
            { name: "_id", type: "text", label: "ID" },
            { name: "visibility", type: "text", label: "Visibility" }
          ]
        }
      }
    }

//working on


export default {
  "name": "Measurify GUI",
  "baseUrl": "https://localhost/v1",
  "pages": [
    {
      "name": "Things",
      "id": "things",
      "description": "Manage and visualize things in the database.",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "docs",
          "url": "/things",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "cards"
          },

          "fields": [
            {
              "name": "_id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "visibility",
              "type": "text",
              "label": "Visibility"
            }
          ]
        },
        "getSingle": {
          "url": "/things/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/things/:id",
          "fields": [
            {
              "name": "visibility",
              "type": "text",
              "label": "Visibility"
            }
          ]
        },
        "post": {
          "url": "/things",
          "fields": [
            {
              "name": "_id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "visibility",
              "type": "text",
              "label": "Visibility"
            }
          ]
        },
        "delete": {
          "url": "/things/:id"
        }
      },
      "customActions": [
        {
          "name":"Delete Thing",
          "url": "/things/:id/",
          "actualMethod": "delete",
          "fields": [
            {
              "name": "id"
            }
          ]
        }
      ]
    },
    {
      "name": "Employees",
      "id": "employees",
      "description": "Manage GOT employees, people and employees.",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "items",
          "url": "/employee",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "table"
          },
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "name",
              "type": "text",
              "label": "Name"
            },
            {
              "name": "jobTitle",
              "type": "text",
              "label": "Job Title"
            },
            {
              "name": "isFired",
              "type": "boolean",
              "label": "Fired?"
            }
          ]
        },
        "getSingle": {
          "url": "/employee/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/employee/:id",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "jobTitle",
              "type": "select",
              "label": "Job Title",
              "options": ["Executive Producer", "Co-Executive Producer", "RESTool creator 😎", "A Knows nothing dude."]
            },
            {
              "name": "isFired",
              "type": "boolean",
              "label": "Fired?"
            }
          ]
        },
        "post": {
          "url": "/employee",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "jobTitle",
              "type": "select",
              "label": "Job Title",
              "options": ["Executive Producer", "Co-Executive Producer", "RESTool creator 😎", "A Knows nothing dude."]
            },
            {
              "name": "isFired",
              "type": "boolean",
              "label": "Fired?"
            }
          ]
        },
        "delete": {
          "url": "/employee/:id"
        }
      }
    },
    {
      "name": "Deads",
      "id": "deads",
      "description": "Manage GOT deads 😵",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "items",
          "url": "/dead",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "table"
          },
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "name",
              "type": "text",
              "label": "Name"
            },
            {
              "name": "reason",
              "type": "text",
              "label": "Death Reason"
            }
          ],
          "dataTransform": item => Object.assign(item, { wiki: `https://en.wikipedia.org/wiki/${item.name}` })
        },
        "getSingle": {
          "url": "/dead/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/dead/:id",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "reason",
              "label": "Reason",
              "type": "text"
            }
          ]
        },
        "post": {
          "url": "/dead",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            },
            {
              "name": "reason",
              "label": "Reason",
              "type": "text"
            }
          ]
        },
        "delete": {
          "url": "/dead/:id"
        }
      }
    },
    {
      "name": "Extras",
      "id": "extras",
      "description": "Manage GOT extras location and budget.",
      "methods": {
        "getAll": {
          "label": "Get All",
          "dataPath": "items",
          "url": "/extra",
          "queryParams": [
            {
              "name": "search",
              "value": "",
              "label": "Search",
              "type": "text"
            }
          ],
          "display": {
            "type": "table"
          },
          "fields": [
            {
              "name": "id",
              "type": "text",
              "label": "ID"
            },
            {
              "name": "name",
              "type": "text",
              "label": "Name"
            }
          ]
        },
        "getSingle": {
          "url": "/extra/:id",
          "queryParams": [],
          "requestHeaders": {}
        },
        "put": {
          "url": "/extra/:id",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            }
          ]
        },
        "post": {
          "url": "/extra",
          "fields": [
            {
              "name": "name",
              "label": "Name",
              "type": "text"
            }
          ]
        },
        "delete": {
          "url": "/extra/:id"
        }
      }
    }
  ]
}
*/