import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import Explorer from "./components/Explorer";
import { extendTheme } from '@chakra-ui/react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000 },
  },
});

const theme = extendTheme({
  components: {
      Table: {
          variants: {
              simple: {
                  th: {
                      borderColor: "gray",
                  },
                  td: {
                      borderColor: "gray",
                  }
              }
          }
      },
  }
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route index element={<Explorer />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
