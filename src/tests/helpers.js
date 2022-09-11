import React from "react";
import PropTypes from "prop-types";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const queryClient = new QueryClient();

function ProvidersWrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

ProvidersWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export const renderWithProviders = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "", route);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: ProvidersWrapper }),
  };
};
