 import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { apiVersion, dataset, projectId } from "./env";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  apiVersion,
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("bloggyNepal")
          .items([
            S.listItem()
              .title("Stories")
              .child(S.documentTypeList("post").title("Stories")),
            S.listItem()
              .title("Destinations")
              .child(S.documentTypeList("destination").title("Destinations")),
          ]),
    }),
  ],
});
