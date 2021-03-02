export default {
  name: "Measurify GUI",
  baseUrl: "https://localhost/v1",
  loginUrl: "/login",
  unauthorizedRedirectUrl: "/#/",

  pages: [
    ///////////// THINGS PAGES
    {
      name: "Things",
      id: "things",
      description: "Visualizzazione e gestione delle Thing",
      itemName: "Thing",

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
              label: "ID",
            },
            {
              name: "tags",
              type: "select",
              label: "Filtra Tag",
              optionSource: {
                url: "/tags",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "limit",
              value: "",
              type: "select",
              options: ["5", "10", "50"],
              label: "Risultati per pagina",
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: "Pagina",
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
              name: "relations_enroll",
              type: "text",
              label: "Relations",
            },
            {
              name: "tags_enroll",
              type: "text",
              label: "Tags",
            },
          ],

          dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                tags_enroll:
                  item.tags.join() !== ""
                    ? "[" + item.tags.join(" , ") + "]"
                    : "Nessun Tag",
                relations_enroll:
                  item.relations.join() !== ""
                    ? "[" + item.relations.join() + "]"
                    : "Nessuna Relation",
              })
            ),

          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" }, limit: { name: "limit" } },
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
              name: "tags",
              type: "array",
              arrayType: "text",
              label: "Tags",
            },
          ],
        },

        post: {
          url: "/things/",
          fields: [
            {
              name: "_id",
              label: "ID",
              type: "text",
            },
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
            {
              name: "relations",
              type: "array",
              arrayType: "text",
              label: "Relations",
            },
            {
              name: "tags",
              type: "array",
              arrayType: "text",
              label: "Tags",
            },
          ],
        },
        delete: {
          url: "/things/:_id",
        },
      },
    },

    ///////////// FEATURES PAGE
    {
      name: "Features",
      id: "features",
      description: "Visualizzazione e gestione delle Feature.",
      itemName: "Feature",
      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/features",
          queryParams: [
            {
              name: "_id",
              value: "",
              label: "ID",
              type: "text",
            },
            {
              name: "tags",
              type: "select",
              label: "Filtra Tag",
              optionSource: {
                url: "/tags",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "limit",
              value: "",
              type: "select",
              options: ["5", "10", "50"],
              label: "Risultati per pagina",
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: "Pagina",
            },
          ],
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
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
            {
              name: "tags_enroll",
              type: "text",
              label: "Tags",
            },
            {
              name: "item_name_enroll",
              type: "text",
              label: "Items",
            },
          ],

          dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                tags_enroll:
                  item.tags.join() !== ""
                    ? "[" + item.tags.join(" , ") + "]"
                    : "Nessun Tag",
                item_name_enroll:
                  item.items.map((e) => e.name).join() !== ""
                    ? "[" + item.items.map((e) => e.name).join(" , ") + "]"
                    : "Nessun Item",
              })
            ),

          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" }, limit: { name: "limit" } },
            fields: { total: { dataPath: "totalDocs" } },
          },
        },
        getSingle: {
          url: "/features/:_id",
          queryParams: [],
          requestHeaders: {},
        },
        post: {
          url: "/features/",
          fields: [
            {
              name: "_id",
              label: "ID",
              type: "text",
            },
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
            {
              name: "tags",
              type: "array",
              arrayType: "text",
              label: "Tags",
            },
            {
              name: "items",
              type: "array",
              arrayType: "object",
              label: "Items",
              value: [
                {
                  dimension: "0 scalar / 1 array / 2 matrix",
                  type: "",
                  name: "",
                  unit: "",
                },
              ],
            },
          ],
        },
        delete: {
          url: "/features/:_id",
        },
      },

      customActions: [
        {
          name: "Expand and edit",
          url: "/features/:_id",
          dataPath: "items",
          actualMethod: "put",
          icon: "search-plus",
          fields: [
            {
              name: "_id",
              label: "ID",
              type: "text",
            },
            {
              name: "visibility",
              label: "Visibility",
              type: "text",
            },
            {
              name: "tags",
              label: "Tags",
              type: "array",
              arrayType: "text",
            },
            {
              name: "items",
              type: "array",
              arrayType: "object",
              label: "Items",
            },
          ],
        },
      ],
    },

    //////////// DEVICES PAGE
    {
      name: "Devices",
      id: "devices",
      description: "Visualizzazione e gestione dei Device.",
      itemName: "Device",
      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/devices",
          queryParams: [
            {
              name: "_id",
              value: "",
              label: "ID",
              type: "text",
            },
            {
              name: "tags",
              type: "select",
              label: "Filtra Tag",
              optionSource: {
                url: "/tags",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "limit",
              value: "",
              type: "select",
              options: ["5", "10", "50"],
              label: "Risultati per pagina",
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: "Pagina",
            },
          ],
          display: {
            type: "cards",
          },
          fields: [
            {
              name: "_id",
              type: "text",
              label: "Id",
            },
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
            {
              name: "period",
              type: "text",
              label: "Period",
            },
            {
              name: "cycle",
              type: "text",
              label: "Cicle",
            },
            {
              name: "tags_enroll",
              type: "text",
              label: "Tags",
            },
            {
              name: "features_enroll",
              type: "text",
              label: "Features",
            },
            {
              name: "scripts_enroll",
              type: "text",
              label: "Scripts",
            },
          ],

          dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                tags_enroll:
                  item.tags.join() !== ""
                    ? "[" + item.tags.join(" , ") + "]"
                    : "Nessun Tag",
                features_enroll:
                  item.features.join() !== ""
                    ? "[" + item.features.join(" , ") + "]"
                    : "Nessuna Feature",
                scripts_enroll:
                  item.scripts.join() !== ""
                    ? "[" + item.scripts.join(" , ") + "]"
                    : "Nessuno Script",
              })
            ),

          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" }, limit: { name: "limit" } },
            fields: { total: { dataPath: "totalDocs" } },
          },
        },
        getSingle: {
          url: "/devices/:_id",
          queryParams: [],
          requestHeaders: {},
        },
        post: {
          url: "/devices",
          fields: [
            {
              name: "name",
              label: "Name",
              type: "text",
            },
          ],
        },
        delete: {
          url: "/devices/:_id",
        },
      },
    },

    ///////////// MEASUREMENTS PAGE
    {
      name: "Measurements",
      id: "measurements",
      description: "Visualizzazione e gestione delle Measure.",
      itemName: "Measure",
      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/measurements",
          queryParams: [
            {
              name: "thing",
              type: "select",
              label: "Filtra Thing",
              optionSource: {
                url: "/things",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "feature",
              type: "select",
              label: "Filtra Feature",
              optionSource: {
                url: "/features",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "device",
              type: "select",
              label: "Filtra Device",
              optionSource: {
                url: "/devices",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "tags",
              type: "select",
              label: "Filtra Tag",
              optionSource: {
                url: "/tags",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "limit",
              value: "",
              type: "select",
              options: ["5", "10", "50"],
              label: "Risultati per pagina",
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: "Pagina",
            },
          ],
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
              name: "feature",
              type: "text",
              label: "Feature",
            },
            {
              name: "sample_enroll",
              type: "text",
              label: "Sample",
            },

            {
              name: "thing",
              type: "text",
              label: "Thing",
            },

            {
              name: "device",
              type: "text",
              label: "Device",
            },
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
            },
            {
              name: "tags_enroll",
              type: "text",
              label: "Tags",
            },
          ],

          dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                tags_enroll:
                  item.tags.join() !== ""
                    ? "[" + item.tags.join(" , ") + "]"
                    : "Nessun Tag",
                sample_enroll:
                  "[" + item.samples.map((e) => e.values).join(" , ") + "]",
              })
            ),

          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" }, limit: { name: "limit" } },
            fields: { total: { dataPath: "totalDocs" } },
          },
        },
        getSingle: {
          url: "/measurements/:_id",
          queryParams: [],
          requestHeaders: {},
        },

        graph: {
          url: "/measurements/",
          fields: [
            {
              name: "feature",
              required : true,
              type: "select",
              label: "Sel. Feature",
              optionSource: {
                url: "/features",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },

            {
              name: "device",
              type: "select",
              label: "Sel. Device",
              optionSource: {
                url: "/devices",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
          ],
        },

        delete: {
          url: "/features/:_id",
        },
      },

      customActions: [
        {
          name: "Expand and edit",
          url: "/features/:_id",
          dataPath: "items",
          actualMethod: "put",
          icon: "search",
          fields: [
            {
              name: "_id",
              label: "ID",
              type: "text",
              readonly: true,
            },
            {
              name: "startDate",
              label: "Start Date",
              type: "text",
              readonly: true,
            },
            {
              name: "endDate",
              label: "End Date",
              type: "text",
              readonly: true,
            },
            {
              name: "visibility",
              label: "Visibility",
              type: "text",
            },
            {
              name: "thing",
              label: "Thing",
              type: "text",
              readonly: true,
            },
            {
              name: "feature",
              label: "Feature",
              type: "text",
              readonly: true,
            },
            {
              name: "device",
              label: "Device",
              type: "text",
              readonly: true,
            },
            {
              name: "samples",
              type: "array",
              arrayType: "object",
              label: "Samples",
            },
            {
              name: "tags",
              label: "Tags",
              type: "array",
              arrayType: "text",
            },
          ],
        },
      ],
    },

    //////////////////  TAGS PAGE
    {
      name: "Tags",
      id: "tags",
      description: "Visualizzazione e gestione dei Tag.",
      itemName: "Tag",
      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/tags",
          queryParams: [
            {
              name: "_id",
              value: "",
              label: "ID",
              type: "text",
            },
            {
              name: "limit",
              value: "10",
              type: "select",
              options: ["5", "10", "50"],
              label: "Risultati per pagina",
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: "Pagina",
            },
          ],
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
              name: "tags_enroll",
              type: "text",
              label: "Tags",
            },
          ],

          dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                tags_enroll:
                  item.tags.join() !== ""
                    ? "[" + item.tags.join(" , ") + "]"
                    : "Nessun Tag",
              })
            ),

          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" }, limit: { name: "limit" } },
            fields: { total: { dataPath: "totalDocs" } },
          },
        },
        getSingle: {
          url: "/tags/:_id",
          queryParams: [],
          requestHeaders: {},
        },
        post: {
          url: "/tags",
          fields: [
            {
              name: "name",
              label: "Name",
              type: "text",
            },
          ],
        },
        delete: {
          url: "/tags/:_id",
        },
      },
    },
  ],
};
