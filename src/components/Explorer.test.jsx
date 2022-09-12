import React from "react";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { renderWithProviders } from "../tests/helpers";
import Explorer from "./Explorer";

const s3Mock = mockClient(S3Client);

describe("successful data fetching", () => {
  beforeAll(() => {
    // Resemble the following bucket structure:
    // www.example.com
    // ├── folder
    // │   └── file.txt
    // └── index.html
    s3Mock.reset();
    s3Mock
      .on(ListObjectsV2Command)
      .resolves({})
      .on(ListObjectsV2Command, {
        Bucket: process.env.BUCKET_NAME,
        Prefix: "",
        Delimiter: "/",
      })
      .resolves({
        CommonPrefixes: [{ Prefix: "folder/" }],
        Contents: [
          {
            Key: "index.html",
            LastModified: new Date("2020-01-01"),
            Size: 100,
          },
        ],
      })
      .on(ListObjectsV2Command, {
        Bucket: process.env.BUCKET_NAME,
        Prefix: "folder/",
        Delimiter: "/",
      })
      .resolves({
        Contents: [
          {
            Key: "folder/file.txt",
            LastModified: new Date("2020-02-01"),
            Size: 200,
          },
        ],
      });
  });

  test("renders basic layout", async () => {
    renderWithProviders(<Explorer />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  test("shows top-level contents", async () => {
    renderWithProviders(<Explorer />);

    expect(
      await screen.findByRole("row", { name: /folder\// })
    ).toBeInTheDocument();
  });

  test("filters contents matching exclude pattern", async () => {
    renderWithProviders(<Explorer />);

    await waitForElementToBeRemoved(
      screen.queryByText("Loading...", { selector: "span" }) // spinner
    );
    expect(
      screen.queryByRole("row", { name: /index\.html/ })
    ).not.toBeInTheDocument();
  });

  test("shows no contents for invalid prefix", async () => {
    renderWithProviders(<Explorer />, { route: "/?prefix=dummy/" });

    await waitForElementToBeRemoved(
      screen.queryByText("Loading...", { selector: "span" }) // spinner
    );
    expect(screen.getAllByRole("rowgroup")[1]).toBeEmptyDOMElement();
  });

  test("can navigate through contents", async () => {
    const { user } = renderWithProviders(<Explorer />);

    await user.click(await screen.findByRole("link", { name: "folder/" }));
    expect(
      await screen.findByRole("row", { name: /file\.txt/ })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "bucket root" }));
    expect(
      await screen.findByRole("row", { name: /folder\// })
    ).toBeInTheDocument();
  });
});

describe("failed data fetching", () => {
  beforeAll(() => {
    // Throw an error when listing the bucket.
    s3Mock.reset();
    s3Mock.on(ListObjectsV2Command).rejects("Error");
  });

  test("shows error message", async () => {
    renderWithProviders(<Explorer />);

    expect(
      await screen.findByRole("row", { name: "Failed to fetch data: Error" })
    ).toBeInTheDocument();
  });
});
