"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import AtherSocketClient from "@/components/utils/ather";
import https from "https";
import { AtherSocketResponse, Container, SystemStatus } from "@/types/ather";

type TokenOrKey = "token" | "access_key";

const config = {
  token: "a0eab1d4-2cd9-4df6-908f-998f751dd25b",
  token_type: "token" as TokenOrKey,
};

const WS_URL = "ws://10.2.0.35:8378/wss";
const API_URL = "http://10.2.0.35:8368";

const useAtherSocketClient = () => {
  const atherRef = useRef<AtherSocketClient | null>(null);

  useEffect(() => {
    if (!atherRef.current) {
      const ather = new AtherSocketClient({
        ws_config: {
          url: WS_URL,
          rejectUnauthorized: false,
        },
        http_config: {
          url: API_URL,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        },
      });

      ather.login(config.token, config.token_type);
      atherRef.current = ather;
    }

    return () => {
      atherRef.current?.disconnect();
      atherRef.current = null;
    };
  }, []);

  return atherRef;
};

const WebSocketDashboard: React.FC = () => {
  const atherClient = useAtherSocketClient();
  const [containers, setContainers] = useState<Container[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu: 0,
    memory: { total: 0, free: 0 },
    storage: 0,
  });

  const toMB = useCallback((bytes: number) => {
    const mb = Math.round((bytes / 1024 / 1024) * 100) / 100;
    return mb > 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
  }, []);

  const handleMessage = useCallback((data: AtherSocketResponse) => {
    console.log("Full WebSocket message:", data);
  
    if (data.type === "lxd") {
      switch (data.action) {
        case "getContainers":
          if (Array.isArray(data.data)) {
            console.log("Containers list:", data.data);
            setContainers(data.data);
          } else {
            console.error("Invalid or missing container data:", data.data);
          }
          break;
          interface ContainerData {
            name: string;
            state: string;
          }
          case "containerStateChanged":
            if (data.data?.name && data.data?.state) {
              setContainers((prevContainers) =>
                prevContainers.map((container) =>
                  container.name === data.data.name
                    ? { ...container, state: data.data.state }
                    : container
                )
              );
            }
            break;
        default:
          console.warn("Unknown LXD action:", data.action);
      }
    } else if (data.type === "system" && data.action === "status") {
      if (data.data) {
        console.log("System status:", data.data);
        setSystemStatus(data.data);
      } else {
        console.error("No system status data in response:", data);
      }
    } else {
      console.warn("Unhandled message type:", data.type);
    }
  }, []);

  const fetchContainers = useCallback(() => {
    atherClient.current?.emit("message", {
      type: "lxd",
      action: "getContainers",
    });
  }, [atherClient]);

  const fetchSystemStatus = useCallback(() => {
    atherClient.current?.emit("message", {
      type: "system",
      action: "getStatus",
    });
  }, [atherClient]);

  useEffect(() => {
    if (atherClient.current) {
      atherClient.current.on("message", handleMessage);
      atherClient.current.on("error", (error) =>
        console.error("WebSocket error:", error)
      );
    }

    return () => {
      atherClient.current?.removeListener("message", handleMessage);
      atherClient.current?.removeListener("error", console.error);
    };
  }, [atherClient, handleMessage]);

  useEffect(() => {
    fetchContainers();
    fetchSystemStatus();

    const interval = setInterval(() => {
      fetchContainers();
      fetchSystemStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchContainers, fetchSystemStatus]);

  const handleContainerAction = useCallback(
    (name: string, action: "start" | "stop") => {
      atherClient.current?.emit("message", {
        type: "lxd",
        action: action === "start" ? "startContainer" : "stopContainer",
        data: { name },
      });
    },
    [atherClient]
  );

  const handleSSH = useCallback((name: string) => {
    window.location.href = `https://dash.ather1.net/lxdShell.php?instance=${name}`;
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-xl-12 col-md-6 mb-4">
          <h3 className="text-white-700">Welcome!</h3>
        </div>
      </div>

      <div className="row">
        <SystemStatusCard
          title="Server Load"
          value={`${systemStatus.cpu.toFixed(1)}%`}
          icon="fas fa-server"
          color="warning"
        />
        <SystemStatusCard
          title={`Memory (${toMB(
            systemStatus.memory.total - systemStatus.memory.free
          )} / ${toMB(systemStatus.memory.total)})`}
          value={`${(
            ((systemStatus.memory.total - systemStatus.memory.free) /
              systemStatus.memory.total) *
            100
          ).toFixed(1)}%`}
          icon="fas fa-memory"
          color="info"
        />
        <SystemStatusCard
          title="Storage"
          value={`${systemStatus.storage.toFixed(1)}%`}
          icon="fas fa-hdd"
          color="primary"
        />
        <SystemStatusCard
          title="Instances"
          value={`${containers.filter(
            (c) => c.state?.status === "Running"
          ).length} / ${containers.length}`}
          icon="fas fa-cube"
          color="success"
        />
      </div>

      <div className="row">
        <div className="col-xl-8 col-lg-12">
          <div className="card shadow h-100 py-2">
            <div className="card-body">
              <div className="table-responsive">
                <table
                  className="table table-bordered"
                  id="containerTable"
                  width="100%"
                >
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Memory Usage</th>
                      <th>OS</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {containers.map((container) => (
                      <tr key={container.name}>
                        <td>{container.name}</td>
                        <td>{container.state?.status || "Unknown"}</td>
                        <td>{toMB(container.state?.memory?.usage || 0)}</td>
                        <td>
                          {container.metadata?.properties?.os || "Unknown"}
                        </td>
                        <td>
                          {container.state?.status === "Stopped" ? (
                            <button
                              className="btn btn-outline-success"
                              onClick={() =>
                                handleContainerAction(container.name, "start")
                              }
                            >
                              Start
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  handleContainerAction(container.name, "stop")
                                }
                              >
                                Stop
                              </button>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleSSH(container.name)}
                              >
                                SSH
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SystemStatusCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className="col-xl-3 col-md-6 mb-4">
    <div className={`card border-left-${color} shadow h-100 py-2`}>
      <div className="card-body">
        <div className="row no-gutters align-items-center">
          <div className="col mr-2">
            <div className={`text-xs font-weight-bold text-${color} mb-1`}>
              {title}
            </div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">
              {value}
            </div>
          </div>
          <div className="col-auto">
            <i className={`${icon} fa-2x text-gray-300`} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default WebSocketDashboard;
