import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  Layout,
  createLayoutModel,
  createTab,
  createTabSet,
  createRow,
  createColumn,
  updateNodeById,
  findNodeById,
  removeEmptyTabsets,
  removeTab,
  restoreTab,
  type LayoutModel,
  type LayoutRef,
  type LayoutAction,
  type SelectTabPayload,
  type CloseTabsetPayload,
  type ComponentRestoreData,
  type LayoutNode,
} from "layout-manager-react";
import { storage, isStorageAvailable } from "./utils/storage";

// Sample components for the demo
const SampleComponent: React.FC<{
  title: string;
  color: string;
  icon?: string;
}> = ({ title, color, icon }) => (
  <div
    style={{
      padding: "40px",
      backgroundColor: color,
      height: "100%",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "bold",
      textAlign: "center",
      boxShadow: "inset 0 0 100px rgba(0,0,0,0.1)",
    }}
  >
    {icon && (
      <div
        style={{
          fontSize: "64px",
          marginBottom: "20px",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
        }}
      >
        {icon}
      </div>
    )}
    <div style={{ fontSize: "28px", marginBottom: "10px" }}>{title}</div>
    <div
      style={{
        fontSize: "14px",
        opacity: 0.9,
        fontWeight: "normal",
        marginTop: "10px",
      }}
    >
      Drag me to reorganize
    </div>
  </div>
);

// Custom close icon component
const CustomCloseIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// Component configuration mapping
const COMPONENT_CONFIG: Record<
  string,
  { tabId: string; component: string; name: string }
> = {
  dashboard: {
    tabId: "tab-dashboard",
    component: "dashboard",
    name: "Dashboard",
  },
  analytics: {
    tabId: "tab-analytics",
    component: "analytics",
    name: "Analytics",
  },
  reports: { tabId: "tab-reports", component: "reports", name: "Reports" },
  notifications: {
    tabId: "tab-notifications",
    component: "notifications",
    name: "Notifications",
  },
  messages: { tabId: "tab-messages", component: "messages", name: "Messages" },
  editor: { tabId: "tab-editor", component: "editor", name: "Code Editor" },
  terminal: { tabId: "tab-terminal", component: "terminal", name: "Terminal" },
  output: { tabId: "tab-output", component: "output", name: "Output" },
  console: { tabId: "tab-console", component: "console", name: "Console" },
  logs: { tabId: "tab-logs", component: "logs", name: "Logs" },
  settings: { tabId: "tab-settings", component: "settings", name: "Settings" },
  properties: {
    tabId: "tab-properties",
    component: "properties",
    name: "Properties",
  },
  explorer: { tabId: "tab-explorer", component: "explorer", name: "Explorer" },
  search: { tabId: "tab-search", component: "search", name: "Search" },
  git: { tabId: "tab-git", component: "git", name: "Git" },
  extensions: {
    tabId: "tab-extensions",
    component: "extensions",
    name: "Extensions",
  },
};

const App: React.FC = () => {
  const layoutRef = useRef<LayoutRef>(null);
  const [storageEnabled, setStorageEnabled] = useState(() => {
    const saved = storage.getItem("demo-storage-enabled");
    return saved ? JSON.parse(saved) : true;
  });
  const [storageKey] = useState("demo-layout");

  // Try to load direction from storage first, fallback to "ltr"
  const getInitialDirection = (): "ltr" | "rtl" => {
    if (storageEnabled && isStorageAvailable()) {
      const savedData = storage.getItem(storageKey);
      if (savedData) {
        try {
          const savedModel = JSON.parse(savedData) as LayoutModel;
          if (savedModel?.global?.direction) {
            return savedModel.global.direction;
          }
        } catch (error) {
          console.warn("Failed to parse saved layout:", error);
        }
      }
    }
    return "ltr";
  };

  const [direction, setDirection] = useState<"ltr" | "rtl">(
    getInitialDirection
  );

  // Create default initial model
  const createDefaultModel = useCallback(
    (dir: "ltr" | "rtl" = direction): LayoutModel => {
      return createLayoutModel(
        createRow("root", [
          createColumn("left-panel", [
            createTabSet("left-main", [
              createTab("tab-dashboard", "dashboard", "Dashboard"),
              createTab("tab-analytics", "analytics", "Analytics"),
              createTab("tab-reports", "reports", "Reports"),
            ]),
            createTabSet("left-secondary", [
              createTab("tab-notifications", "notifications", "Notifications"),
              createTab("tab-messages", "messages", "Messages"),
            ]),
          ]),
          createColumn("center-panel", [
            createRow("top-center", [
              createTabSet("center-main", [
                createTab("tab-editor", "editor", "Code Editor"),
                createTab("tab-terminal", "terminal", "Terminal"),
                createTab("tab-output", "output", "Output"),
              ]),
            ]),
            createRow("bottom-center", [
              createTabSet("center-bottom", [
                createTab("tab-console", "console", "Console"),
                createTab("tab-logs", "logs", "Logs"),
              ]),
            ]),
          ]),
          createColumn("right-panel", [
            createTabSet("right-main", [
              createTab("tab-settings", "settings", "Settings"),
              createTab("tab-properties", "properties", "Properties"),
              createTab("tab-explorer", "explorer", "Explorer"),
              createTab("tab-search", "search", "Search"),
            ]),
            createTabSet("right-secondary", [
              createTab("tab-git", "git", "Git"),
              createTab("tab-extensions", "extensions", "Extensions"),
            ]),
          ]),
        ]),
        {
          splitterSize: 8,
          direction: dir,
        }
      );
    },
    [direction]
  );

  // Load model from storage or use default
  const getInitialModel = useCallback((): LayoutModel => {
    if (storageEnabled && isStorageAvailable()) {
      const savedData = storage.getItem(storageKey);
      if (savedData) {
        try {
          const savedModel = JSON.parse(savedData) as LayoutModel;
          if (savedModel && savedModel.layout) {
            // Ensure direction is set
            return {
              ...savedModel,
              global: {
                ...savedModel.global,
                direction: savedModel.global?.direction || direction,
              },
            };
          }
        } catch (error) {
          console.warn("Failed to parse saved layout:", error);
        }
      }
    }
    return createDefaultModel(direction);
  }, [storageEnabled, storageKey, direction, createDefaultModel]);

  const [model, setModel] = useState<LayoutModel>(getInitialModel);

  // Memoize default model layout for restoration purposes
  const defaultModelLayout = useMemo(
    () => createDefaultModel(direction).layout,
    [createDefaultModel, direction]
  );

  // Sync direction from model when it's loaded from storage
  useEffect(() => {
    if (model.global?.direction && model.global.direction !== direction) {
      setDirection(model.global.direction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.global?.direction]);

  // Store minimal restoration data in ref (no re-renders, memory efficient)
  const restoreDataRef = useRef<Map<string, ComponentRestoreData>>(new Map());

  // Load restoration data from model metadata on mount and when model changes
  useEffect(() => {
    if (model.metadata?.restoreData) {
      const data = model.metadata.restoreData as Record<
        string,
        ComponentRestoreData
      >;
      restoreDataRef.current = new Map(Object.entries(data));
    }
  }, [model.metadata?.restoreData]);

  // Auto-save model to storage when it changes (with debouncing)
  useEffect(() => {
    if (!storageEnabled || !isStorageAvailable()) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        storage.setItem(storageKey, JSON.stringify(model));
      } catch (error) {
        console.warn("Failed to save layout to storage:", error);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [model, storageEnabled, storageKey]);

  // Helper function to find tab ID by component name
  const findTabIdByComponent = useCallback(
    (layout: LayoutNode, component: string): string | null => {
      if (layout.type === "tab" && layout.component === component) {
        return layout.id;
      }
      if (layout.children) {
        for (const child of layout.children) {
          const found = findTabIdByComponent(child, component);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  // Helper function to check if a component exists in layout
  const componentExists = useCallback(
    (layout: LayoutNode, componentName: string): boolean => {
      if (layout.type === "tab" && layout.component === componentName) {
        return true;
      }
      if (layout.children) {
        for (const child of layout.children) {
          if (componentExists(child, componentName)) {
            return true;
          }
        }
      }
      return false;
    },
    []
  );

  // Check if a component is visible (tab exists in layout)
  const isComponentVisible = useCallback(
    (componentKey: string) => {
      const config = COMPONENT_CONFIG[componentKey];
      if (!config) return false;
      return componentExists(model.layout, config.component);
    },
    [model.layout, componentExists]
  );

  // Toggle component visibility
  const toggleComponent = useCallback(
    (componentKey: string) => {
      const config = COMPONENT_CONFIG[componentKey];
      if (!config) return;

      setModel((prev) => {
        if (componentExists(prev.layout, config.component)) {
          // Find the tab ID by component name
          const tabId = findTabIdByComponent(prev.layout, config.component);
          if (tabId) {
            const removed = removeTab(prev.layout, tabId);
            if (removed.layout && removed.restoreData) {
              // Store restore data using component name as key
              restoreDataRef.current.set(config.component, removed.restoreData);
              const cleaned = removeEmptyTabsets(removed.layout);
              if (cleaned) {
                return {
                  ...prev,
                  layout: cleaned,
                };
              }
            }
          }
        } else {
          // Restore the component
          let restoreData = restoreDataRef.current.get(config.component);

          // If no restore data exists, try to create it from default model layout
          if (!restoreData) {
            const initialTabId = findTabIdByComponent(
              defaultModelLayout,
              config.component
            );
            if (initialTabId) {
              // Try to remove and immediately restore to get restore data
              const tempRemoved = removeTab(defaultModelLayout, initialTabId);
              if (tempRemoved.restoreData) {
                restoreData = tempRemoved.restoreData;
                restoreDataRef.current.set(config.component, restoreData);
              }
            }
          }

          if (restoreData) {
            const restored = restoreTab(
              prev.layout,
              restoreData,
              defaultModelLayout
            );
            if (restored) {
              // Don't delete restore data - keep it for future toggles
              return {
                ...prev,
                layout: restored,
              };
            }
          }
        }
        return prev;
      });
    },
    [defaultModelLayout, findTabIdByComponent, componentExists]
  );

  const factory = useCallback((node: LayoutNode) => {
    switch (node.component) {
      case "dashboard":
        return <SampleComponent title="Dashboard" color="#4CAF50" icon="📊" />;
      case "analytics":
        return <SampleComponent title="Analytics" color="#2196F3" icon="📈" />;
      case "reports":
        return <SampleComponent title="Reports" color="#00BCD4" icon="📄" />;
      case "notifications":
        return (
          <SampleComponent title="Notifications" color="#FF9800" icon="🔔" />
        );
      case "messages":
        return <SampleComponent title="Messages" color="#9C27B0" icon="💬" />;
      case "editor":
        return (
          <SampleComponent title="Code Editor" color="#607D8B" icon="💻" />
        );
      case "terminal":
        return <SampleComponent title="Terminal" color="#212121" icon="⌨️" />;
      case "output":
        return <SampleComponent title="Output" color="#795548" icon="📤" />;
      case "console":
        return <SampleComponent title="Console" color="#F44336" icon="🖥️" />;
      case "logs":
        return <SampleComponent title="Logs" color="#9C27B0" icon="📋" />;
      case "settings":
        return <SampleComponent title="Settings" color="#FF9800" icon="⚙️" />;
      case "properties":
        return <SampleComponent title="Properties" color="#3F51B5" icon="🔧" />;
      case "explorer":
        return <SampleComponent title="Explorer" color="#009688" icon="📁" />;
      case "search":
        return <SampleComponent title="Search" color="#E91E63" icon="🔍" />;
      case "git":
        return <SampleComponent title="Git" color="#F44336" icon="🔀" />;
      case "extensions":
        return <SampleComponent title="Extensions" color="#FFC107" icon="🧩" />;
      default:
        return <div>Unknown component: {node.component}</div>;
    }
  }, []);

  const handleAction = useCallback(
    (action: LayoutAction) => {
      if (action.type === "selectTab") {
        const { nodeId, tabIndex } = action.payload as SelectTabPayload;
        setModel((prevModel) => {
          const selectResult = updateNodeById(prevModel.layout, nodeId, {
            selected: tabIndex,
          });
          return {
            ...prevModel,
            layout: selectResult || prevModel.layout,
          };
        });
      }
      if (action.type === "removeNode") {
        const { nodeId, tabIndex } = action.payload as {
          nodeId: string;
          tabIndex: number;
        };
        const tabsetNode = findNodeById(model.layout, nodeId);
        if (
          tabsetNode &&
          tabsetNode.children &&
          tabsetNode.children[tabIndex]
        ) {
          const closedTab = tabsetNode.children[tabIndex];

          // Use package utility to remove tab and get restoration data
          const result = removeTab(model.layout, closedTab.id);

          if (result.layout && result.restoreData) {
            // Store minimal restoration data (memory efficient)
            restoreDataRef.current.set(closedTab.id, result.restoreData);

            const cleanedLayout = removeEmptyTabsets(result.layout);
            if (cleanedLayout) {
              // Update model with cleaned layout and restoration data
              const restoreData = Object.fromEntries(restoreDataRef.current);
              const updatedModel = {
                ...model,
                layout: cleanedLayout,
                global: {
                  ...model.global,
                  direction: direction, // Use direction state to ensure latest value
                },
                metadata: {
                  ...model.metadata,
                  restoreData: restoreData,
                },
              };

              setModel(updatedModel);
            }
          }
        }
      }
      if (action.type === "closeTabset") {
        const { nodeId } = action.payload as CloseTabsetPayload;
        const tabsetNode = findNodeById(model.layout, nodeId);
        if (tabsetNode && tabsetNode.type === "tabset" && tabsetNode.children) {
          // Store restoration data for all tabs in the tabset
          const restoreDataMap = new Map<string, ComponentRestoreData>();
          tabsetNode.children.forEach((tab) => {
            if (tab.type === "tab") {
              const result = removeTab(model.layout, tab.id);
              if (result.restoreData) {
                restoreDataRef.current.set(tab.id, result.restoreData);
                restoreDataMap.set(tab.id, result.restoreData);
              }
            }
          });

          // Update model with restoration data
          const restoreData = Object.fromEntries(restoreDataRef.current);
          const updatedModel = {
            ...model,
            metadata: {
              ...model.metadata,
              restoreData: restoreData,
            },
          };
          setModel(updatedModel);

          // Remove the tabset
          const updatedLayout = updateNodeById(model.layout, nodeId, null);
          if (updatedLayout) {
            const cleanedLayout = removeEmptyTabsets(updatedLayout);
            if (cleanedLayout) {
              setModel((prevModel) => ({
                ...prevModel,
                layout: cleanedLayout,
                global: {
                  ...prevModel.global,
                  direction: direction, // Use direction state to ensure latest value
                },
              }));
            }
          }
        }
      }
      if (action.type === "changeDirection") {
        const { direction: newDirection } = action.payload as {
          direction: "ltr" | "rtl";
        };
        setModel((prevModel) => ({
          ...prevModel,
          global: {
            ...prevModel.global,
            direction: newDirection,
          },
        }));
      }
    },
    [model, direction]
  );

  const toggleDirection = useCallback(() => {
    const newDirection = direction === "ltr" ? "rtl" : "ltr";
    setDirection(newDirection);

    if (layoutRef.current) {
      layoutRef.current.handleAction({
        type: "changeDirection",
        payload: { direction: newDirection },
      });
    } else {
      const updatedModel: LayoutModel = {
        ...model,
        global: {
          ...model.global,
          direction: newDirection as "ltr" | "rtl",
        },
      };
      setModel(updatedModel);
    }
  }, [direction, model]);

  const clearStorage = useCallback(() => {
    if (isStorageAvailable()) {
      storage.removeItem(storageKey);
      setModel(createDefaultModel(direction));
    }
  }, [storageKey, createDefaultModel, direction]);

  const resetLayout = useCallback(() => {
    setModel(createDefaultModel(direction));
  }, [createDefaultModel, direction]);

  // Memoize closeIcon to prevent unnecessary re-renders
  const memoizedCloseIcon = useMemo(() => <CustomCloseIcon />, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header with Controls */}
      <header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "15px 20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        {/* Left side - Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          <span style={{ fontSize: "24px" }}>🎛️</span>
          <span>Layout Manager Demo</span>
        </div>

        {/* Right side - Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Direction Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.15)",
              padding: "8px 15px",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: "16px" }}>🌐</span>
            <button
              onClick={toggleDirection}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                border: "none",
                borderRadius: "6px",
                background:
                  direction === "rtl"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.2)",
                color: "white",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  direction === "rtl"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.2)";
              }}
            >
              {direction === "ltr" ? "RTL" : "LTR"}
            </button>
            <span style={{ fontSize: "12px", opacity: 0.9 }}>
              {direction.toUpperCase()}
            </span>
          </div>

          {/* Storage Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.15)",
              padding: "8px 15px",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontWeight: "500",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={storageEnabled}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setStorageEnabled(newValue);
                  storage.setItem(
                    "demo-storage-enabled",
                    JSON.stringify(newValue)
                  );
                }}
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />
              <span>💾</span>
              <span>Storage</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={clearStorage}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                border: "none",
                borderRadius: "8px",
                background: "rgba(244, 67, 54, 0.9)",
                color: "white",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(244, 67, 54, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(244, 67, 54, 0.3)";
              }}
            >
              🗑️ Clear
            </button>
            <button
              onClick={resetLayout}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                border: "none",
                borderRadius: "8px",
                background: "rgba(255, 152, 0, 0.9)",
                color: "white",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(255, 152, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(255, 152, 0, 0.3)";
              }}
            >
              🔄 Reset
            </button>
          </div>

          {/* Component Toggles Dropdown */}
          <div
            style={{
              position: "relative",
              background: "rgba(255, 255, 255, 0.15)",
              padding: "8px 15px",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
            }}
          >
            <details
              style={{
                cursor: "pointer",
              }}
            >
              <summary
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>🧩</span>
                <span>Components</span>
              </summary>
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  padding: "15px",
                  minWidth: "280px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  zIndex: 1001,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Component Toggles
                </h4>
                <div>
                  {Object.entries(COMPONENT_CONFIG).map(([key, config]) => {
                    const isVisible = isComponentVisible(key);
                    const iconMap: Record<string, string> = {
                      dashboard: "📊",
                      analytics: "📈",
                      reports: "📄",
                      notifications: "🔔",
                      messages: "💬",
                      editor: "💻",
                      terminal: "⌨️",
                      output: "📤",
                      console: "🖥️",
                      logs: "📋",
                      settings: "⚙️",
                      properties: "🔧",
                      explorer: "📁",
                      search: "🔍",
                      git: "🔀",
                      extensions: "🧩",
                    };
                    return (
                      <label
                        key={key}
                        style={{
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          background: isVisible
                            ? "rgba(33, 150, 243, 0.08)"
                            : "transparent",
                          border: isVisible
                            ? "1px solid rgba(33, 150, 243, 0.2)"
                            : "1px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isVisible
                            ? "rgba(33, 150, 243, 0.12)"
                            : "rgba(0, 0, 0, 0.03)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isVisible
                            ? "rgba(33, 150, 243, 0.08)"
                            : "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleComponent(key)}
                          style={{
                            marginRight: "10px",
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ marginRight: "8px", fontSize: "16px" }}>
                          {iconMap[key] || "📌"}
                        </span>
                        <span
                          style={{
                            fontWeight: isVisible ? "500" : "400",
                            color: isVisible ? "#2196F3" : "#666",
                          }}
                        >
                          {config.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* Layout Container */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Layout
          ref={layoutRef}
          model={model}
          factory={factory}
          onModelChange={(newModel) => {
            // Only update if the layout actually changed (not just metadata)
            // This prevents infinite loops when we update metadata
            const layoutChanged =
              JSON.stringify(model.layout) !== JSON.stringify(newModel.layout);

            // Always sync direction first, regardless of layout change
            if (
              newModel.global?.direction &&
              newModel.global.direction !== direction
            ) {
              setDirection(newModel.global.direction);
            }

            if (layoutChanged) {
              // Preserve restoration data when layout changes from drag/drop
              // Check if all tabs still exist (not removed, just moved)
              const preservedRestoreData = model.metadata?.restoreData;
              // Use direction state which is now synced above
              const currentDirection = direction;

              setModel({
                ...newModel,
                global: {
                  ...newModel.global,
                  direction: newModel.global?.direction || currentDirection, // Preserve direction
                },
                metadata: {
                  ...newModel.metadata,
                  // Preserve existing restoration data - drag/drop doesn't remove components
                  restoreData:
                    preservedRestoreData || newModel.metadata?.restoreData,
                },
              });
            } else {
              // Layout didn't change, just update metadata if needed
              // Also preserve direction
              const currentDirection = direction;
              if (
                newModel.metadata?.restoreData ||
                newModel.global?.direction
              ) {
                setModel((prev) => ({
                  ...prev,
                  global: {
                    ...prev.global,
                    direction:
                      newModel.global?.direction ||
                      prev.global?.direction ||
                      currentDirection, // Preserve direction
                  },
                  metadata: newModel.metadata || prev.metadata,
                }));
              }
            }
          }}
          onAction={(action) => {
            if (action.type !== "changeDirection") {
              handleAction(action);
            }
          }}
          closeIcon={memoizedCloseIcon}
          closeButtonClassName="demo-custom-close-button"
        />
      </div>
    </div>
  );
};

export default App;
