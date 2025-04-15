import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { Link as ReactRouterLink, useSearchParams } from "react-router-dom";
import {
  Box,
  VStack,
  Link,
  Breadcrumb,
  Table,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { GrHome, GrFolder, GrDocument } from "react-icons/gr";
import { useContents } from "../hooks/useContents";
import { sanitizePrefix, formatFileSize } from "../helpers";

export default function Explorer() {
  const [searchParams] = useSearchParams();
  const prefix = sanitizePrefix(searchParams.get("prefix") || "");

  useEffect(() => {
    document.title = process.env.BUCKET_NAME || "S3 Browser";
  }, []);

  return (
    <Box maxW="4xl" m={3} mt={1}>
      <VStack alignItems="left">
        <Navigation prefix={prefix} />
        <Listing prefix={prefix} />
      </VStack>
    </Box>
  );
}

function Navigation({ prefix }) {
  const folders = prefix
    .split("/")
    .slice(0, -1)
    .map((item, index, items) => ({
      name: `${item}/`,
      url: `/?prefix=${items.slice(0, index + 1).join("/")}/`,
      isCurrent: index === items.length - 1,
    }));

  return (
    <Breadcrumb.Root
      size="lg"
      borderWidth="1px"
      shadow="md"
      p={2}
      background="gray.100"
    >
      <Breadcrumb.List>
        <Breadcrumb.Item key="root">
          {folders.length === 0 ? (
            <Breadcrumb.CurrentLink fontWeight="bold">
              <Icon as={GrHome} mr={2} verticalAlign="text-top" />
              {process.env.BUCKET_NAME}
            </Breadcrumb.CurrentLink>
          ) : (
            <Breadcrumb.Link asChild aria-label="bucket root">
              <ReactRouterLink to="">
                <Icon as={GrHome} verticalAlign="text-top" />
              </ReactRouterLink>
            </Breadcrumb.Link>
          )}
        </Breadcrumb.Item>
        {folders.map((item) => (
          <Fragment key={item.url}>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              {item.isCurrent ? (
                <Breadcrumb.CurrentLink fontWeight="bold">
                  {item.name}
                </Breadcrumb.CurrentLink>
              ) : (
                <Breadcrumb.Link asChild>
                  <ReactRouterLink to={item.url}>{item.name}</ReactRouterLink>
                </Breadcrumb.Link>
              )}
            </Breadcrumb.Item>
          </Fragment>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}

Navigation.propTypes = {
  prefix: PropTypes.string,
};

function Listing({ prefix }) {
  const { status, data, error } = useContents(prefix);
  console.debug(`Query status: ${status}`);

  return (
    <Box borderWidth="1px" shadow="md">
      <Table.Root variant="outline" size="sm">
        <Table.Header background="gray.200">
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Last modified</Table.ColumnHeader>
            <Table.ColumnHeader>Size</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(() => {
            switch (status) {
              case "loading":
                return (
                  <Table.Row>
                    <Table.Cell colSpan={3} textAlign="center">
                      <Spinner size="sm" verticalAlign="middle" mr={1} />
                      Loading...
                    </Table.Cell>
                  </Table.Row>
                );
              case "error":
                return (
                  <Table.Row>
                    <Table.Cell colSpan={3} textAlign="center">
                      Failed to fetch data: {error.message}
                    </Table.Cell>
                  </Table.Row>
                );
              case "success":
                return (
                  <>
                    {data?.folders.map((item) => (
                      <Table.Row key={item.path}>
                        <Table.Cell>
                          <Icon as={GrFolder} mr={1} verticalAlign="text-top" />
                          <Link asChild>
                            <ReactRouterLink to={item.url}>
                              {item.name}
                            </ReactRouterLink>
                          </Link>
                        </Table.Cell>
                        <Table.Cell>–</Table.Cell>
                        <Table.Cell textAlign="right">–</Table.Cell>
                      </Table.Row>
                    ))}
                    {data?.objects.map((item) => (
                      <Table.Row key={item.path}>
                        <Table.Cell>
                          <Icon
                            as={GrDocument}
                            mr={1}
                            verticalAlign="text-top"
                          />
                          <Link
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.name}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>
                          {item.lastModified.toLocaleString()}
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          {formatFileSize(item.size)}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </>
                );
            }
          })()}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

Listing.propTypes = {
  prefix: PropTypes.string,
};
