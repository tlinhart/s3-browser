import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  VStack,
} from "@chakra-ui/react";
import ObjectsList from "./ObjectsList"
import Navigation from "./Navigation"
import { sanitizePrefix } from "../helpers";

export default function Explorer() {

  const [searchParams] = useSearchParams();
  const prefix = sanitizePrefix(searchParams.get("prefix") || "");

  useEffect(() => {
    document.title = "S3 Browser";
  }, []);

  return (
    <Box background="#063B2B" height="100vh">
      <VStack background="black" alignItems="left">
        <Navigation prefix={prefix}/>
        <ObjectsList prefix={prefix}/>
      </VStack>
    </Box>
  );
}
