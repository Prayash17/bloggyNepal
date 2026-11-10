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
              ),

            S.divider(),

            S.listItem()
              .title("Destinations — Published")
              .child(
                S.documentTypeList("destination")
                  .title("Published Destinations")
                  .apiVersion(apiVersion)
                  .filter(
                    '_type == "destination" && !(_id in path("drafts.**"))'
                  )
              ),

            S.listItem()
              .title("Destinations — Drafts")
              .child(
                S.documentTypeList("destination")
                  .title("Draft Destinations")
                  .apiVersion(apiVersion)
                  .filter(
                    '_type == "destination" && _id in path("drafts.**")'
                  )
              ),

            S.listItem()
              .title("All Destinations")
              .child(
                S.documentTypeList("destination")
                  .title("All Destinations")
              ),

            S.divider(),

            S.listItem()
              .title("Districts")
              .child(
                S.documentTypeList("district")
                  .title("Districts")
              ),

            S.listItem()
              .title("Provinces")
              .child(
                S.documentTypeList("province")
                  .title("Provinces")
              ),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
