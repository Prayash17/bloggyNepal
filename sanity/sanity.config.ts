import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { apiVersion, dataset, projectId } from "./env";

export default defineConfig({
  name: "bloggynepal",
  title: "BloggyNepal",

  projectId,
  dataset,
  apiVersion,

  basePath: "/studio",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("BloggyNepal")
          .items([
            S.listItem()
              .title("Stories")
              .child(
                S.documentTypeList("post")
                  .title("Stories")
                  .filter('_type == "post"')
              ),

            S.listItem()
              .title("Destinations")
              .child(
                S.documentTypeList("destination")
                  .title("Destinations")
                  .filter('_type == "destination"')
              ),

            S.listItem()
              .title("Districts")
              .child(
                S.documentTypeList("district")
                  .title("Districts")
                  .filter('_type == "district"')
              ),

            S.listItem()
              .title("Provinces")
              .child(
                S.documentTypeList("province")
                  .title("Provinces")
                  .filter('_type == "province"')
              ),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});