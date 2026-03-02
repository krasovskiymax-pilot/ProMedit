"use client";

import { useState, useEffect, useCallback } from "react";

type DbTarget = "local" | "working";

export default function ViewDbPage() {
  const [db, setDb] = useState<DbTarget>("local");
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openTable, setOpenTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{
    rows: Record<string, unknown>[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/view-db/tables?db=${db}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch tables");
      setTables(data.tables || []);
      setOpenTable(null);
      setTableData(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const loadTable = useCallback(
    async (table: string, page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/view-db/data?db=${db}&table=${encodeURIComponent(table)}&page=${page}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load table");
        setOpenTable(table);
        setTableData({
          rows: data.rows || [],
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.totalPages || 0,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  const handleDelete = async (
    table: string,
    idColumn: string,
    idValue: unknown
  ) => {
    if (!confirm("Удалить запись?")) return;
    try {
      const res = await fetch("/api/view-db/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db,
          table,
          idColumn,
          idValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      if (openTable === table) loadTable(table, tableData?.page || 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleCreate = async (table: string, row: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/view-db/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db, table, row }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setCreating(false);
      if (openTable === table) loadTable(table, 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleUpdate = async (
    table: string,
    idColumn: string,
    idValue: unknown,
    row: Record<string, unknown>
  ) => {
    try {
      const res = await fetch("/api/view-db/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db, table, idColumn, idValue, row }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setEditingId(null);
      if (openTable === table) loadTable(table, tableData?.page || 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const cols = tableData?.rows[0]
    ? Object.keys(tableData.rows[0])
    : [];

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>view-db</h1>

      <div style={styles.selector}>
        <label>
          <input
            type="radio"
            name="db"
            checked={db === "local"}
            onChange={() => setDb("local")}
          />
          Локальная БД (DATABASE_URL)
        </label>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            name="db"
            checked={db === "working"}
            onChange={() => setDb("working")}
          />
          Рабочая БД (DATABASE_URL_WORKING)
        </label>
      </div>

      {error && (
        <div style={styles.error}>Ошибка: {error}</div>
      )}

      <div style={styles.section}>
        <h2 style={styles.h2}>Таблицы</h2>
        {loading && !openTable ? (
          <p>Загрузка...</p>
        ) : (
          <div style={styles.tableList}>
            {tables.map((t) => (
              <div key={t} style={styles.tableItem}>
                <span style={styles.tableName}>{t}</span>
                <button
                  style={styles.btn}
                  onClick={() => loadTable(t)}
                  disabled={loading}
                >
                  Открыть
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {openTable && (
        <div style={styles.section}>
          <h2 style={styles.h2}>
            Таблица: {openTable}
            <button
              style={{ ...styles.btn, marginLeft: 12 }}
              onClick={() => setCreating(true)}
            >
              + Создать
            </button>
          </h2>

          {loading && openTable ? (
            <p>Загрузка...</p>
          ) : tableData && tableData.rows.length > 0 ? (
            <>
              <div style={styles.pagination}>
                <button
                  style={styles.btn}
                  disabled={tableData.page <= 1}
                  onClick={() => loadTable(openTable, tableData.page - 1)}
                >
                  ← Назад
                </button>
                <span style={styles.pageInfo}>
                  {tableData.page} / {tableData.totalPages} (всего {tableData.total})
                </span>
                <button
                  style={styles.btn}
                  disabled={tableData.page >= tableData.totalPages}
                  onClick={() => loadTable(openTable, tableData.page + 1)}
                >
                  Вперёд →
                </button>
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {cols.map((c) => (
                        <th key={c} style={styles.th}>
                          {c}
                        </th>
                      ))}
                      <th style={styles.th}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, idx) => {
                      const idCol = cols[0];
                      const idVal = row[idCol];
                      const rowKey = String(idVal ?? idx);
                      const isEditing = editingId === rowKey;

                      return (
                        <tr key={rowKey}>
                          {cols.map((c) => (
                            <td key={c} style={styles.td}>
                              {formatCell(row[c])}
                            </td>
                          ))}
                          <td style={styles.td}>
                            {isEditing ? (
                              <button
                                style={styles.btnSmall}
                                onClick={() => setEditingId(null)}
                              >
                                Отмена
                              </button>
                            ) : (
                              <>
                                <button
                                  style={styles.btnSmall}
                                  onClick={() => setEditingId(rowKey)}
                                >
                                  Изменить
                                </button>
                                <button
                                  style={{
                                    ...styles.btnSmall,
                                    ...styles.btnDanger,
                                  }}
                                  onClick={() =>
                                    handleDelete(openTable, idCol, idVal)
                                  }
                                >
                                  Удалить
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>Таблица пуста</p>
          )}
        </div>
      )}

      {creating && openTable && cols.length > 0 && (
        <CreateModal
          table={openTable}
          columns={cols}
          onSave={(row) => handleCreate(openTable, row)}
          onCancel={() => setCreating(false)}
        />
      )}

      {editingId && openTable && tableData && cols.length > 0 && (
        <EditModal
          table={openTable}
          columns={cols}
          row={
            tableData.rows.find(
              (r) => String(r[cols[0]]) === editingId
            )!
          }
          onSave={(row) =>
            handleUpdate(
              openTable,
              cols[0],
              tableData.rows.find((r) => String(r[cols[0]]) === editingId)?.[
                cols[0]
              ],
              row
            )
          }
          onCancel={() => setEditingId(null)}
        />
      )}
    </main>
  );
}

function formatCell(val: unknown): string {
  if (val == null) return "—";
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function CreateModal({
  table,
  columns,
  onSave,
  onCancel,
}: {
  table: string;
  columns: string[];
  onSave: (row: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [row, setRow] = useState<Record<string, unknown>>(
    Object.fromEntries(columns.map((c) => [c, ""]))
  );
  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Создать запись в {table}</h3>
        {columns.map((c) => (
          <div key={c} style={styles.formRow}>
            <label style={styles.label}>{c}</label>
            <input
              style={styles.input}
              value={String(row[c] ?? "")}
              onChange={(e) =>
                setRow((prev) => ({ ...prev, [c]: e.target.value }))
              }
            />
          </div>
        ))}
        <div style={styles.modalActions}>
          <button style={styles.btn} onClick={onCancel}>
            Отмена
          </button>
          <button
            style={styles.btn}
            onClick={() => onSave(row)}
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  table,
  columns,
  row,
  onSave,
  onCancel,
}: {
  table: string;
  columns: string[];
  row: Record<string, unknown>;
  onSave: (row: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [ edited, setEdited ] = useState<Record<string, unknown>>(
    { ...row }
  );
  const idCol = columns[0];
  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Изменить запись в {table}</h3>
        {columns.map((c) => (
          <div key={c} style={styles.formRow}>
            <label style={styles.label}>{c}</label>
            <input
              style={styles.input}
              value={String(edited[c] ?? "")}
              readOnly={c === idCol}
              onChange={(e) =>
                setEdited((prev) => ({ ...prev, [c]: e.target.value }))
              }
            />
          </div>
        ))}
        <div style={styles.modalActions}>
          <button style={styles.btn} onClick={onCancel}>
            Отмена
          </button>
          <button style={styles.btn} onClick={() => onSave(edited)}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: "2rem",
    fontFamily: "system-ui, sans-serif",
    maxWidth: 1200,
    margin: "0 auto",
  },
  h1: { marginBottom: "1rem" },
  h2: { marginBottom: "0.5rem", fontSize: "1.1rem" },
  selector: { marginBottom: "1.5rem" },
  error: {
    color: "#c00",
    marginBottom: "1rem",
    padding: "0.5rem",
    background: "#fee",
    borderRadius: 4,
  },
  section: { marginBottom: "2rem" },
  tableList: { display: "flex", flexDirection: "column", gap: 8 },
  tableItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  tableName: { fontFamily: "monospace" },
  btn: {
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid #ccc",
    background: "#f5f5f5",
  },
  btnSmall: {
    padding: "4px 8px",
    fontSize: 12,
    cursor: "pointer",
    marginRight: 4,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  btnDanger: { background: "#fcc", borderColor: "#c99" },
  pagination: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  pageInfo: { fontSize: 14, color: "#666" },
  tableWrap: { overflowX: "auto" },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: 14,
  },
  th: {
    border: "1px solid #ccc",
    padding: "8px 12px",
    textAlign: "left",
    background: "#f0f0f0",
  },
  td: {
    border: "1px solid #ccc",
    padding: "8px 12px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: 8,
    minWidth: 400,
    maxWidth: "90vw",
  },
  formRow: { marginBottom: 12 },
  label: { display: "block", marginBottom: 4, fontSize: 12 },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  modalActions: {
    display: "flex",
    gap: 12,
    marginTop: "1rem",
    justifyContent: "flex-end",
  },
};
