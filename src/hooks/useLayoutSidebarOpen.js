import { useContext } from "react";
import LayoutSidebarContext from "../context/LayoutSidebarContext";

const useLayoutSidebarOpen = () => useContext(LayoutSidebarContext);

export default useLayoutSidebarOpen;
