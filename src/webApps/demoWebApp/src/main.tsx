import * as React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

import type { IAppProps } from "./types";

export default (initialState: IAppProps, el: HTMLElement) => {
  ReactDOM.hydrate(
    <App message={initialState.message} name={initialState.name} />,
    el
  );
};
