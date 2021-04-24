export function configurator(locale){return  {
  name: "Measurify GUI",
  //baseUrl: "https://students.atmosphere.tools/v1",
  baseUrl: "https://localhost/v1",
  loginUrl: "/login",
  unauthorizedRedirectUrl: "/#/",

  pages: [

    ///////////// USERS PAGES
    {
      name: "Users",
      id: "users",
      description: locale().user_page_description,
      itemName: "User",

      accessedBy: ["admin"],
      methods: {
        getAll: {
          dataPath: "docs",
          label: "Users",
          url: "/users/",

          queryParams: [
            {
              name: "username",
              value: "",
              type: "text",
              label: "Username",
            },
            {
              name: "limit",
              value: "",
              type: "select",
              options: ["5", "10", "50"],
              label: locale().results_for_page,
            },
          ],

          display: {
            type: "table",
          },
          fields: [

            {
              name: "username",
              type: "text",
              label: "Username",
            },
            {
              name: "_id",
              type: "text",
              label: "ID",
            },
            {
              name: "status",
              type: "text",
              label: "Status",
            },
            {
              name: "email",
              type: "text",
              label: "Email",
            },
            {
              name: "type",
              type: "text",
              label: "Type",
            },
            {
              name: "fieldmask",
              type: "text",
              label: "Fieldmask",
            },
          ],


          pagination: {
            type: "buttons",
            source: "query",
            params: { page: { name: "page" }, limit: { name: "limit" } },
            fields: { total: { dataPath: "totalDocs" } },
          },
        },
        getSingle: {
          url: "/users/:_id/",
          dataPath: "docs",
          queryParams: [],
          requestHeaders: {},
        },

        post: {
          url: "/users/",
          fields: [
            {
              name: "username",
              label: "Username",
              type: "text",
            },
            {
              name: "password",
              type: "text",
              label: "Password",
            },
            {
              name: "status",
              type: "select",
              label: "Status",
              optionSource: {
                url: "",
                preLoad: true,
                name : "UserStatusTypes",
              },
            },
            {
              name: "email",
              type: "text",
              label: "Email",
            },
            {
              name: "type",
              type: "select",
              label: "Type",
              optionSource: {
                url: "",
                preLoad: true,
                name : "UserRoles",
              },
            },
            {
              name: "fieldmask",
              type: "select",
              label: "Fieldmask",
              optionSource: {
                url: "/fieldmasks",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
          ],
        },

        put: {
          url: "/users/:_id",
          fields: [
            {
              name: "username",
              label: "Username",
              type: "text",
              disabled: true,
            },
            {
              name: "password",
              type: "text",
              label: "Password",
              required: true
            },
            {
              name: "email",
              type: "text",
              label: "Email",
              disabled: true,
            },
            {
              name: "type",
              type: "text",
              label: "Type",
              disabled: true,
            },
            {
              name: "fieldmask",
              type: "select",
              label: "Fieldmask",
              optionSource: {
                url: "/fieldmasks",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
          ],
        },
        delete: {
          url: "/users/:_id",
        },
      },
    },


    ///////////// THINGS PAGES
    {
      name: "Things",
      id: "things",
      description: locale().thing_page_description,
      itemName: "Thing",

      accessedBy: ["admin", "analyst"],

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
              label: locale().filter_tag,
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
              label: locale().results_for_page,
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: locale().page,
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
                    : locale().no_tag,
                relations_enroll:
                  item.relations.join() !== ""
                    ? "[" + item.relations.join() + "]"
                    : locale().no_relation,
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
              name: "_id",
              type: "text",
              label: "ID",
              disabled: true,
            },
            {
              name: "visibility",
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
            },
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
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
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
      description: locale().feature_page_description,
      itemName: "Feature",
      accessedBy: ["admin", "analyst"],

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
              label: locale().filter_tag,
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
              label: locale().results_for_page,
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: locale().page,
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
                    : locale().no_tag,
                item_name_enroll:
                  item.items.map((e) => e.name).join() !== ""
                    ? "[" + item.items.map((e) => e.name).join(" , ") + "]"
                    : locale().no_item,
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
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
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
                  dimension: locale().dimensions_guide,
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
          name: locale().expand_and_edit,
          url: "/features/:_id",
          dataPath: "items",
          actualMethod: "put",
          icon: "search-plus",
          fields: [
            {
              name: "_id",
              label: "ID",
              type: "text",
              disabled: true,
            },
            {
              name: "visibility",
              label: "Visibility",
              type: "text",
              disabled: true,
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
              disabled: true,
            },
          ],
        },
        {
          name: locale().clone_and_edit,
          url: "/features/",
          dataPath: "items",
          actualMethod: "post",
          icon: "copy",
          fields: [
            {
              name: "_id",
              label: locale().id_suggestion,
              type: "text",
            },
            {
              name: "visibility",
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
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
      description: locale().device_page_description,
      itemName: "Device",
      accessedBy: ["admin", "analyst"],

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
              label: locale().filter_tag,
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
              label: locale().results_for_page,
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: locale().page,
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
                    : locale().no_tag,
                features_enroll:
                  item.features.join() !== ""
                    ? "[" + item.features.join(" , ") + "]"
                    : locale().no_feature,
                scripts_enroll:
                  item.scripts.join() !== ""
                    ? "[" + item.scripts.join(" , ") + "]"
                    : locale().no_script,
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
              name: "_id",
              type: "text",
              label: "Id",
            },
            {
              name: "visibility",
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
            },
            {
              name: "period",
              type: "text",
              label: "Period",
              value : "5s",
            },
            {
              name: "cycle",
              type: "text",
              label: "Cicle",
              value : "10m",
            },
            {
              name: "retryTime",
              type: "text",
              label: "Retry Time",
              value : "10s",
            },
            {
              name: "tags",
              type: "array",
              arrayType: "text",
              label: "Tags",
            },
            {
              name: "features",
              type: "array",
              arrayType: "text",
              label: "Features",
            },
            {
              name: "scripts",
              type: "array",
              arrayType: "text",
              label: "Scripts",
            },
            {
              name: "scriptListMaxSize",
              type: "number",
              label: "Script List Max Size",
              value : 5,
            },
            {
              name: "measurementBufferSize",
              type: "number",
              label: "Measurement Buffer Size",
              value : 20,
            },
            {
              name: "issueBufferSize",
              type: "number",
              label: "Issue Buffer Size",
              value : 20,
            },
            {
              name: "sendBufferSize",
              type: "number",
              label: "Send Buffer Size",
              value : 20,
            },
            {
              name: "scriptStatementMaxSize",
              type: "number",
              label: "Script Statement Max Size",
              value : 5,
            },
            {
              name: "statementBufferSize",
              type: "number",
              label: "Statement Buffer Size",
              value : 10,
            },
            {
              name: "measurementBufferPolicy",
              type: "text",
              label: "Measurement Buffer Policy",
              value : "MeasurementBufferPolicyTypes.newest",
            },
          ],
        },



        delete: {
          url: "/devices/:_id",
        },

      },
      customActions: [
        {
          name: locale().expand_and_edit,
          url: "/devices/:_id",
          dataPath: "items",
          actualMethod: "put",
          icon: "search-plus",
          fields: [
            {
              name: "_id",
              type: "text",
              label: "Id",
              disabled: true,
            },
            {
              name: "visibility",
              type: "text",
              label: "Visibility",
              disabled: true,
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
              name: "retryTime",
              type: "text",
              label: "Retry Time",
            },
            {
              name: "tags",
              type: "array",
              arrayType: "text",
              label: "Tags",
            },
            {
              name: "features",
              type: "array",
              arrayType: "text",
              label: "Features",
            },
            {
              name: "scripts",
              type: "array",
              arrayType: "text",
              label: "Scripts",
            },
            {
              name: "scriptListMaxSize",
              type: "number",
              label: "Script List Max Size",
            },
            {
              name: "measurementBufferSize",
              type: "number",
              label: "Measurement Buffer Size",
            },
            {
              name: "issueBufferSize",
              type: "number",
              label: "Issue Buffer Size",
            },
            {
              name: "sendBufferSize",
              type: "number",
              label: "Send Buffer Size",
            },
            {
              name: "scriptStatementMaxSize",
              type: "number",
              label: "Script Statement Max Size",
            },
            {
              name: "statementBufferSize",
              type: "number",
              label: "Statement Buffer Size",
            },
            {
              name: "measurementBufferPolicy",
              type: "text",
              label: "Measurement Buffer Policy",
            },
          ]
        },
      ],

    },
    ///////////// MEASUREMENTS PAGE
    {
      name: "Measurements",
      id: "measurements",
      description: locale().measure_page_description,
      itemName: "Measurement",
      accessedBy: ["admin", "analyst"],

      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/measurements",
          queryParams: [
            {
              name: "thing",
              type: "select",
              label: locale().filter_thing,
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
              label: locale().filter_feature,
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
              label: locale().filter_device,
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
              label: locale().filter_device,
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
              label: locale().results_for_page,
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: locale().page,
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
              name: "startDate",
              type: "text",
              label: "Start Date",
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
                    : locale().no_tag,
                sample_enroll:
                  "" + item.samples.map((e) => " { " + e.values.map((j) => " [ " + j + " ] ") + " } ") + "",
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
          dataPath: "docs",
          fields: [
            {
              name: "feature",
              required: true,
              type: "select",
              label: locale().select_feature,
              optionSource: {
                url: "/features",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },

            {
              name: "thing",
              type: "select",
              label: locale().select_thing,
              optionSource: {
                url: "/things",
                dataPath: "docs",
                displayPath: "_id",
                valuePath: "_id",
              },
            },
            {
              name: "device",
              type: "select",
              label: locale().select_device,
              optionSource: {
                url: "/devices",
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
              label: locale().samples,
            },
            {
              name: "page",
              type: "text",
              label: locale().page,
              value: "1"
            },
          ],
        },

        delete: {
          url: "/features/:_id",
        },
      },

      customActions: [
        {
          name: locale().expand,
          url: "/measurements/:_id",
          dataPath: "items",
          actualMethod: "put",
          icon: "search",
          fields: [
            {
              name: "_id",
              label: "ID",
              type: "text",
              disabled: true,
            },
            {
              name: "startDate",
              label: "Start Date",
              type: "text",
              disabled: true,
            },
            {
              name: "endDate",
              label: "End Date",
              type: "text",
              disabled: true,
            },
            {
              name: "visibility",
              label: "Visibility",
              type: "text",
              disabled: true,
            },
            {
              name: "thing",
              label: "Thing",
              type: "text",
              disabled: true,
            },
            {
              name: "feature",
              label: "Feature",
              type: "text",
              disabled: true,
            },
            {
              name: "device",
              label: "Device",
              type: "text",
              disabled: true,
            },
            {
              name: "samples",
              type: "array",
              arrayType: "object",
              label: "Samples",
              disabled: true,
            },
            {
              name: "tags",
              label: "Tags",
              type: "array",
              arrayType: "text",
              disabled: true,
            },
          ],
        },
      ],
    },

    //////////////////  TAGS PAGE
    {
      name: "Tags",
      id: "tags",
      description: locale().tag_page_description,
      itemName: "Tag",
      accessedBy: ["admin", "analyst"],

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
              label: locale().results_for_page,
            },
            {
              name: "page",
              value: "",
              type: "text",
              label: locale().page,
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
              label: "VIsibility",
            },
            {
              name: "tags_enroll",
              type: "text",
              label: "Tags",
            },
            {
              name: "description",
              type: "text",
              label: "Description",
            },
          ],

          dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                tags_enroll:
                  item.tags.join() !== ""
                    ? "[" + item.tags.join(" , ") + "]"
                    : locale().no_tag,
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
              name: "_id",
              type: "text",
              label: "Id",
            },
            {
              name: "visibility",
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
            },
            {
              name: "tags",
              type: "array",
              arrayType: "text",
              label: "Tags",
            },
            {
              name: "description",
              type: "text",
              label: "Description",
            },
          ],
        },


        put: {
          url: "/tags/:_id",
          fields: [
            {
              name: "_id",
              type: "text",
              label: "Id",
              disabled: true,
            },
            {
              name: "visibility",
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
            },
            {
              name: "tags",
              type: "array",
              arrayType: "text",
              label: "Tags",
            },
            {
              name: "description",
              type: "text",
              label: "Description",
            },
          ],
        },

        delete: {
          url: "/tags/:_id",
        },
      },
    },

    //////////// FIELDMASKS PAGE
    {
      name: "Fieldmasks",
      id: "fieldmasks",
      description: locale().fieldmask_page_description,
      itemName: "Fieldmask",
      accessedBy: ["admin"],

      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/fieldmasks",
          queryParams: [
            {
              name: "_id",
              value: "",
              label: "ID",
              type: "text",
            },
            {
              name: "limit",
              value: "",
              type: "select",
              options: ["5", "10", "50"],
              label: locale().results_for_page,
            }
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
              name: "computation_enroll",
              type: "text",
              label: "Computation Fields",
            },
            {
              name: "device_enroll",
              type: "text",
              label: "Device Fields",
            },
            {
              name: "feature_enroll",
              type: "text",
              label: "Feature Fields",
            },
            {
              name: "measurement_enroll",
              type: "text",
              label: "Measurement Fields",
            },
            {
              name: "script_enroll",
              type: "text",
              label: "Script Fields",
            },
            {
              name: "tag_enroll",
              type: "text",
              label: "Tag Fields",
            },
            {
              name: "thing_enroll",
              type: "text",
              label: "Thing Fields",
            },
          ],

          dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                computation_enroll:
                  item.computation_fields.join() !== ""
                    ? "[" + item.computation_fields.join(" , ") + "]"
                    : locale().full_privileges,
                device_enroll:
                  item.device_fields.join() !== ""
                    ? "[" + item.device_fields.join(" , ") + "]"
                    : locale().full_privileges,
                feature_enroll:
                  item.feature_fields.join() !== ""
                    ? "[" + item.feature_fields.join(" , ") + "]"
                    : locale().full_privileges,
                measurement_enroll:
                  item.measurement_fields.join() !== ""
                    ? "[" + item.measurement_fields.join(" , ") + "]"
                    : locale().full_privileges,
                script_enroll:
                  item.script_fields.join() !== ""
                    ? "[" + item.script_fields.join(" , ") + "]"
                    : locale().full_privileges,
                tag_enroll:
                  item.tag_fields.join() !== ""
                    ? "[" + item.tag_fields.join(" , ") + "]"
                    : locale().full_privileges,
                thing_enroll:
                  item.thing_fields.join() !== ""
                    ? "[" + item.thing_fields.join(" , ") + "]"
                    : locale().full_privileges,
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
          url: "/fieldmasks/:_id",
          queryParams: [],
          requestHeaders: {},
        },
        post: {
          url: "/fieldmasks",
          fields: [
            {
              name: "_id",
              type: "text",
              label: "Id",
            },
            {
              name: "computation_fields",
              type: "array",
              arrayType: "text",
              label: "Computation Fields",
            },
            {
              name: "device_fields",
              type: "array",
              arrayType: "text",
              label: "Device Fields",
            },
            {
              name: "feature_fields",
              type: "array",
              arrayType: "text",
              label: "Feature Fields",
            },
            {
              name: "measurement_fields",
              type: "array",
              arrayType: "text",
              label: "Measurement Fields",
            },
            {
              name: "script_fields",
              type: "array",
              arrayType: "text",
              label: "Script Fields",
            },
            {
              name: "tag_fields",
              type: "array",
              arrayType: "text",
              label: "Tag Fields",
            },
            {
              name: "thing_fields",
              type: "array",
              arrayType: "text",
              label: "Thing Fields",
            }
          ],
        },
        put: {
          url: "/fieldmasks/:_id",
          fields: [
            {
              name: "_id",
              type: "text",
              label: "Id",
              disabled: true,
            },
            {
              name: "computation_fields",
              type: "array",
              arrayType: "text",
              label: "Computation Fields",
            },
            {
              name: "device_fields",
              type: "array",
              arrayType: "text",
              label: "Device Fields",
            },
            {
              name: "feature_fields",
              type: "array",
              arrayType: "text",
              label: "Feature Fields",
            },
            {
              name: "measurement_fields",
              type: "array",
              arrayType: "text",
              label: "Measurement Fields",
            },
            {
              name: "script_fields",
              type: "array",
              arrayType: "text",
              label: "Script Fields",
            },
            {
              name: "tag_fields",
              type: "array",
              arrayType: "text",
              label: "Tag Fields",
            },
            {
              name: "thing_fields",
              type: "array",
              arrayType: "text",
              label: "Thing Fields",
            }
          ],
        },


        delete: {
          url: "/fieldmasks/:_id",
        },
      },
    },

    //////////// RIGHTS PAGE
    {
          name: "Rights",
          id: "rights",
          description: locale().right_page_description,
          itemName: "Right",
          accessedBy: ["admin", "analyst"],

          methods: {
            getAll: {
              label: "Get All",
              dataPath: "docs",
              url: "/rights/",
              queryParams: [
                /*{
                  name: "_id",
                  value: "",
                  label: "ID",
                  type: "text",
                },*/
                {
                  name: "limit",
                  value: "",
                  type: "select",
                  options: ["5", "10", "50"],
                  label: locale().results_for_page,
                }
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
                  name: "resource",
                  type: "text",
                  label: "Resource",
                },
                {
                  name: "type",
                  type: "text",
                  label: "Type",
                },
                {
                  name: "tag_enroll",
                  type: "text",
                  label: "Tags",
                },
                {
                  name: "user_id",
                  type: "text",
                  label: "User's ID",
                },
                {
                  name: "user_username",
                  type: "text",
                  label: "User's Username",
                },
                
                {
                  name: "user_status",
                  type: "text",
                  label: "User' Status",
                },
                {
                  name: "user_fieldmask",
                  type: "text",
                  label: "User's Fieldmask",
                },
                {
                  name: "user_type",
                  type: "text",
                  label: "User's Type",
                },
              ],
    
              dataTransform: (items) =>
                items.map((item) =>
                  Object.assign(item, {
                   
                    tag_enroll:
                      item.tags.join() !== ""
                        ? "[" + item.tags.join(" , ") + "]"
                        :locale().no_tag,
                    user_id:  item.user._id,
                    user_status:  item.user.status,
                    user_username:  item.user.username,
                    user_fieldmask:  item.user.fieldmask,
                    user_type:  item.user.type,
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
              url: "/rights/:_id",
              queryParams: [],
              requestHeaders: {},
            },
            post: {
              url: "/rights",
              fields: [
                {
                  name: "_id",
                  type: "text",
                  label: "ID",
                },
                {
                  name: "resource",
                  type: "text",
                  label: "Resource",
                },
                {
                  name: "type",
                  type: "text",
                  label: "Type",
                },
                {
                  name: "user",
                  type: "text",
                  label: "User ID",
                },
                
              ],
            },
            put: {
              url: "/rights/:_id",
              fields: [
                {
                  name: "_id",
                  type: "text",
                  label: "Id",
                  disabled: true,
                },
                {
                  name: "resource",
                  type: "text",
                  label: "Resource",
                  disabled: true,
                },
                {
                  name: "type",
                  type: "text",
                  label: "Type",
                  disabled: true,
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
              url: "/rights/:_id",
            },
          },
    },


  ///////////// ISSUES PAGE
  {
        name: "Issues",
        id: "issues",
        description: locale().issue_page_description,
        itemName: "Issue",
        accessedBy: ["admin"],

        methods: {
          getAll: {
            label: "Get All",
            dataPath: "docs",
            url: "/issues/",
            queryParams: [
              
              {
                name: "device",
                type: "select",
                label: locale().filter_device,
                optionSource: {
                  url: "/devices",
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
                label: locale().results_for_page,
              }
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
                name: "device_id",
                type: "text",
                label: "Device",
              },
              {
                name: "type",
                type: "text",
                label: "Type",
              },
              {
                name: "status",
                type: "text",
                label: "Status",
              },
              {
                name: "message",
                type: "text",
                label: "Message",
              },
              {
                name: "date",
                type: "text",
                label: "Date",
              },
              {
                name: "owner",
                type: "text",
                label: "Owner",
              },
            
            ],

            dataTransform: (items) =>
            items.map((item) =>
              Object.assign(item, {
                device_id:  item.device._id
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
            url: "/issues/:_id",
            queryParams: [],
            requestHeaders: {},
          },
          post: {
            url: "/issues",
            fields: [
              {
                name: "device",
                type: "text",
                label: "Device",
              },
              {
                name: "date",
                type: "date",
                label: "Date",
              },
              {
                name: "type",
                type: "select",
                label: "Type",
                optionSource: {
                  url: "",
                  preLoad: true,
                  name : "IssueTypes",
                },
              },
              {
                name: "status",
                type: "select",
                label: "Status",
                optionSource: {
                  url: "",
                  preLoad: true,
                  name : "IssueStatusTypes",
                },
              },
              {
                name: "message",
                type: "text",
                label: "Message",
              },
              
            ],
          },
        
          put: {
            url: "/issues/:_id",
            fields: [
              {
                name: "_id",
                type: "text",
                label: "Id",
                disabled: true,
              },
              {
                name: "type",
                type: "text",
                label: "Type",
                disabled: true,
              },
              {
                name: "status",
                type: "select",
                label: "Status",
                optionSource: {
                  url: "",
                  preLoad: true,
                  name : "IssueStatusTypes",
                },
              },
              {
                name: "message",
                type: "text",
                label: "Message",
                disabled: true,
              },
              {
                name: "date",
                type: "text",
                label: "Date",
                disabled: true,
              },
              {
                name: "owner",
                type: "text",
                label: "Owner",
                disabled: true,
              },
            ],
          },
          delete: {
            url: "/issues/:_id",
          },
        },
  },


  /////////// CONSTRAINTS PAGE
  {
      name: "Constraints",
      id: "constraints",
      description: locale().constraint_page_description,
      itemName: "Constraint",
      accessedBy: ["admin"],

      methods: {
        getAll: {
          label: "Get All",
          dataPath: "docs",
          url: "/constraints/",
          queryParams: [
            
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
              name: "type1",
              type: "text",
              label: "Type 1",
            },
            {
              name: "element1",
              type: "text",
              label: "Element 1",
            },
            {
              name: "type2",
              type: "text",
              label: "Type 2",
            },
            {
              name: "element2",
              type: "text",
              label: "Element 2",
            },
            {
              name: "relationship",
              type: "text",
              label: "Relationship",
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
                    : locale().no_tag,
               
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
          url: "/constraints/:_id",
          queryParams: [],
          requestHeaders: {},
        },
        post: {
          url: "/constraints/",
          fields: [
            {
              name: "visibility",
              type: "select",
              label: "Visibility",
              optionSource: {
                url: "",
                preLoad: true,
                name : "VisibilityTypes",
              },
            },
            {
              name: "type1",
              type: "text",
              label: "Type 1",
            },
            {
              name: "element1",
              type: "text",
              label: "Element 1",
            },
            {
              name: "type2",
              type: "text",
              label: "Type 2",
            },
            {
              name: "element2",
              type: "text",
              label: "Element 2",
            },
            {
              name: "relationship",
              type: "select",
              label: "Relationship",
              optionSource: {
                url: "",
                preLoad: true,
                name : "RelationshipTypes",
              },
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
          url: "/constraints/:_id",
        },
      },
  },

  //////////// SCRIPTS PAGE
  {
    name: "Scripts",
    id: "scripts",
    description: locale().script_page_description,
    itemName: "Scripts",
    accessedBy: ["admin", "analyst"],

    methods: {
      getAll: {
        label: "Get All",
        dataPath: "docs",
        url: "/scripts",
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
            label: locale().filter_tag,
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
            label: locale().results_for_page,
          },
          {
            name: "page",
            value: "",
            type: "text",
            label: locale().page,
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
            name: "code",
            type: "text",
            label: "Code",
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
                  : locale().no_tag,
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
        url: "/scripts/:_id",
        queryParams: [],
        requestHeaders: {},
      },
      post: {
        url: "/scripts",
        fields: [
          {
            name: "_id",
            type: "text",
            label: "Id",
          },
          {
            name: "visibility",
            type: "select",
            label: "Visibility",
            optionSource: {
              url: "",
              preLoad: true,
              name : "VisibilityTypes",
            },
          },
          {
            name: "code",
            type: "text",
            label: "Code",
          },
      
          {
            name: "tags",
            type: "array",
            arrayType: "text",
            label: "Tags",
          },
       
        ],
      },

      put: {
        url: "/scripts/:_id",
        fields: [
          {
            name: "_id",
            type: "text",
            label: "Id",
            disabled: true,
          },
          {
            name: "code",
            type: "text",
            label: "Code",
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
        url: "/scripts/:_id",
      },

    },
  
  },

  ],
};
}

