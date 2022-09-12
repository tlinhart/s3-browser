import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Link as ReactRouterLink, useSearchParams } from "react-router-dom";
import {
  Box,
  VStack,
  Heading,
  Text,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { GrHome, GrFolder, GrDocument, GrFormNext } from "react-icons/gr";
import { useContents } from "../hooks/useContents";
import { sanitizePrefix, formatFileSize } from "../helpers";

export default function Explorer() {
  const [searchParams] = useSearchParams();
  const prefix = sanitizePrefix(searchParams.get("prefix") || "");

  useEffect(() => {
    document.title = process.env.BUCKET_NAME;
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
      isCurrent: index == items.length - 1,
    }));

  return (
    <Breadcrumb
      borderWidth="1px"
      shadow="md"
      p={3}
      background="gray.100"
      spacing={1}
      separator={<Icon as={GrFormNext} verticalAlign="middle" />}
    >
      <BreadcrumbItem key="root" isCurrentPage={folders.length == 0}>
        {folders.length == 0 ? (
          <Text color="gray.400">
            <Icon as={GrHome} mr={2} verticalAlign="text-top" />
            {process.env.BUCKET_NAME}
          </Text>
        ) : (
          <BreadcrumbLink as={ReactRouterLink} to="" aria-label="bucket root">
            <Icon as={GrHome} verticalAlign="text-top" />
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {folders.map((item) => (
        <BreadcrumbItem key={item.url} isCurrentPage={item.isCurrent}>
          {item.isCurrent ? (
            <Text color="gray.400">{item.name}</Text>
          ) : (
            <BreadcrumbLink as={ReactRouterLink} to={item.url}>
              {item.name}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

Navigation.propTypes = {
  prefix: PropTypes.string,
};

function Listing({ prefix }) {
  const { status, data, error } = useContents(prefix);
  console.debug(`Query status: ${status}`);

  return (
    <>
      <Heading as="h3" size="lg" mt={2} mb={2} fontWeight="light">
        {prefix
          ? `${prefix.split("/").slice(-2, -1)}/`
          : process.env.BUCKET_NAME}
      </Heading>
      <Box borderWidth="1px" shadow="md">
        <Table variant="simple" size="sm">
          <Thead background="gray.200">
            <Tr>
              <Th>Name</Th>
              <Th>Last modified</Th>
              <Th>Size</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(() => {
              switch (status) {
                case "loading":
                  return (
                    <Tr>
                      <Td colSpan={3} textAlign="center">
                        <Spinner
                          size="sm"
                          emptyColor="gray.200"
                          verticalAlign="middle"
                          mr={1}
                        />
                        Loading...
                      </Td>
                    </Tr>
                  );
                case "error":
                  return (
                    <Tr>
                      <Td colSpan={3} textAlign="center">
                        Failed to fetch data: {error.message}
                      </Td>
                    </Tr>
                  );
                case "success":
                  return (
                    <>
                      {data?.folders.map((item) => (
                        <Tr key={item.path}>
                          <Td>
                            <Icon
                              as={GrFolder}
                              mr={1}
                              verticalAlign="text-top"
                            />
                            <Link as={ReactRouterLink} to={item.url}>
                              {item.name}
                            </Link>
                          </Td>
                          <Td>–</Td>
                          <Td isNumeric>–</Td>
                        </Tr>
                      ))}
                      {data?.objects.map((item) => (
                        <Tr key={item.path}>
                          <Td>
                            <Icon
                              as={GrDocument}
                              mr={1}
                              verticalAlign="text-top"
                            />
                            <Link href={item.url} isExternal>
                              {item.name}
                            </Link>
                          </Td>
                          <Td>{item.lastModified.toLocaleString()}</Td>
                          <Td isNumeric>{formatFileSize(item.size)}</Td>
                        </Tr>
                      ))}
                    </>
                  );
              }
            })()}
          </Tbody>
        </Table>
      </Box>
    </>
  );
}

Listing.propTypes = {
  prefix: PropTypes.string,
};
