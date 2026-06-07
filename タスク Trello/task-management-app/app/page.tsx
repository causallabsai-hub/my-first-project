"use client"

import { useEffect, useState } from "react"

// =========================================================
// type: タスクの型定義
// =========================================================
// DESIGN: タスクの形を明確にして、後から機能追加しても壊れにくくする
type Priority = "高" | "中" | "低"
type TaskStatus = "todo" | "doing" | "done"

type Task = {
  id: number
  title: string
  description: string
  dueDate: string
  priority: Priority
  createdAt: string
  updatedAt: string
}

// =========================================================
// helper: localStorage読み込み
// =========================================================
// FIX: JSONが壊れていてもアプリが止まらないようにtry/catchを入れる
const loadTasks = (key: string): Task[] => {
  if (typeof window === "undefined") return []

  const saved = localStorage.getItem(key)
  if (!saved) return []

  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

export default function App() {
  // =========================================================
  // state: form（新規入力）
  // =========================================================
  const [task, setTask] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<Priority>("中")

  // =========================================================
  // state: search
  // =========================================================
  const [searchText, setSearchText] = useState("")

  // =========================================================
  // state: tasks
  // =========================================================
  // FIX: Hydrationエラー対策
  // NOTE: 初期値でlocalStorageを読まず、useEffectで後から読む
  const [todoTasks, setTodoTasks] = useState<Task[]>([])
  const [doingTasks, setDoingTasks] = useState<Task[]>([])
  const [doneTasks, setDoneTasks] = useState<Task[]>([])

  // =========================================================
  // state: mounted
  // =========================================================
  // FIX: localStorage読み込み前に空配列で上書き保存されるのを防ぐ
  const [mounted, setMounted] = useState(false)

  // =========================================================
  // state: responsive
  // =========================================================
  const [isMobile, setIsMobile] = useState(false)

  // =========================================================
  // state: edit mode
  // =========================================================
  const [editingTask, setEditingTask] = useState<{
    task: Task
    status: TaskStatus
  } | null>(null)

  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editPriority, setEditPriority] = useState<Priority>("中")

  // =========================================================
  // state: drag and drop
  // =========================================================
  const [draggingTask, setDraggingTask] = useState<{
    task: Task
    status: TaskStatus
  } | null>(null)

  // =========================================================
  // style: color palette（落ち着いた柔らかい色）
  // =========================================================
  // DESIGN: 添付画像の色味を参考に、仕事でも使いやすい上品な配色に調整
  const palette = {
    beige: "#D8C09C",
    sage: "#A6B58E",
    olive: "#94A956",
    blue: "#9FCED1",
    cream: "#EDE2BB",
    pink: "#E6CADA",

    white: "#FFFFFF",
    bg: "#FAF8F3",
    text: "#4B4742",
    subText: "#6F6860",
    border: "#D8D1C7",
  }

  // =========================================================
  // style: input
  // =========================================================
  const inputStyle = {
    padding: 10,
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    background: palette.white,
    color: palette.text,
    marginRight: isMobile ? 0 : 8,
    outline: "none",
    boxSizing: "border-box" as const,
  }

  // =========================================================
  // style: buttons
  // =========================================================
  const csvButtonStyle = {
    padding: "10px 16px",
    border: `1px solid ${palette.blue}`,
    borderRadius: 10,
    background: "#E7F3F4",
    color: "#446266",
    cursor: "pointer",
    marginRight: isMobile ? 0 : 6,
    fontWeight: "bold",
  }

  const addButtonStyle = {
    padding: "10px 16px",
    border: `1px solid ${palette.beige}`,
    borderRadius: 10,
    background: "#F3E9DB",
    color: "#6B5942",
    cursor: "pointer",
    marginRight: isMobile ? 0 : 6,
    fontWeight: "bold",
  }

  const startButtonStyle = {
    padding: "10px 14px",
    border: `1px solid ${palette.sage}`,
    borderRadius: 10,
    background: "#E5ECDC",
    color: "#4F6241",
    cursor: "pointer",
    marginRight: 6,
    marginBottom: 6,
    fontWeight: "bold",
  }

  const editButtonStyle = {
    padding: "10px 14px",
    border: `1px solid ${palette.blue}`,
    borderRadius: 10,
    background: "#E7F3F4",
    color: "#446266",
    cursor: "pointer",
    marginRight: 6,
    marginBottom: 6,
    fontWeight: "bold",
  }

  const deleteButtonStyle = {
    padding: "10px 14px",
    border: "1px solid #D69AA8",
    borderRadius: 10,
    background: "#EAC0CA",
    color: "#6F2F3F",
    cursor: "pointer",
    marginRight: 6,
    marginBottom: 6,
    fontWeight: "bold",
  }

  const saveButtonStyle = {
    padding: "10px 14px",
    border: `1px solid ${palette.sage}`,
    borderRadius: 10,
    background: "#E5ECDC",
    color: "#4F6241",
    cursor: "pointer",
    marginRight: 6,
    marginBottom: 6,
    fontWeight: "bold",
  }

  const cancelButtonStyle = {
    padding: "10px 14px",
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    background: "#F3F1EC",
    color: "#5B5752",
    cursor: "pointer",
    marginRight: 6,
    marginBottom: 6,
    fontWeight: "bold",
  }

  const calendarButtonStyle = {
    padding: "10px 14px",
    border: `1px solid ${palette.blue}`,
    borderRadius: 10,
    background: "#E7F3F4",
    color: "#446266",
    cursor: "pointer",
    marginRight: 6,
    marginBottom: 6,
    fontWeight: "bold",
  }

  // =========================================================
  // style: column
  // =========================================================
  const getColumnStyle = (status: TaskStatus) => {
    if (status === "todo") {
      return {
        background: "#F3E9DB",
        border: `1px solid ${palette.beige}`,
      }
    }

    if (status === "doing") {
      return {
        background: "#E5ECDC",
        border: `1px solid ${palette.sage}`,
      }
    }

    return {
      background: "#F5F0D8",
      border: `1px solid ${palette.cream}`,
    }
  }

  // =========================================================
  // helper: 日時表示
  // =========================================================
  const formatDateTime = (value: string) => {
    if (!value) return "-"

    return new Date(value).toLocaleString("ja-JP")
  }

  // =========================================================
  // helper: 全タスクをstatus付きでまとめる
  // =========================================================
  const getAllTasksWithStatus = () => {
    return [
      ...todoTasks.map((t) => ({ ...t, status: "todo" as TaskStatus })),
      ...doingTasks.map((t) => ({ ...t, status: "doing" as TaskStatus })),
      ...doneTasks.map((t) => ({ ...t, status: "done" as TaskStatus })),
    ]
  }

  // =========================================================
  // helper: 検索フィルター
  // =========================================================
  // DESIGN: タイトル・詳細を対象に検索する
  const filterTasks = (tasks: Task[]) => {
    const text = searchText.toLowerCase().trim()

    if (!text) return tasks

    return tasks.filter((item) => {
      return (
        item.title.toLowerCase().includes(text) ||
        item.description.toLowerCase().includes(text)
      )
    })
  }

  // =========================================================
  // helper: タスク生成
  // =========================================================
  const createTask = (): Task => {
    const now = new Date().toISOString()

    return {
      id: Date.now(),
      title: task.trim(),
      description: description.trim(),
      dueDate,
      priority,
      createdAt: now,
      updatedAt: now,
    }
  }

  // =========================================================
  // logic: タスク追加
  // =========================================================
  const addTask = () => {
    if (!task.trim()) {
      alert("タイトルを入力してください。")
      return
    }

    const newTask = createTask()

    setTodoTasks((prev) => [...prev, newTask])

    setTask("")
    setDescription("")
    setDueDate("")
    setPriority("中")
  }

  // =========================================================
  // helper: 更新日時を更新
  // =========================================================
  const updateTaskTimestamp = (taskItem: Task): Task => {
    return {
      ...taskItem,
      updatedAt: new Date().toISOString(),
    }
  }

  // =========================================================
  // logic: タスク移動
  // =========================================================
  // DESIGN: ボタン移動とドラッグ&ドロップ移動で共通利用する
  const moveTask = (
    taskItem: Task,
    fromStatus: TaskStatus,
    toStatus: TaskStatus
  ) => {
    if (fromStatus === toStatus) return

    const updated = updateTaskTimestamp(taskItem)

    if (fromStatus === "todo") {
      setTodoTasks((prev) => prev.filter((t) => t.id !== taskItem.id))
    }

    if (fromStatus === "doing") {
      setDoingTasks((prev) => prev.filter((t) => t.id !== taskItem.id))
    }

    if (fromStatus === "done") {
      setDoneTasks((prev) => prev.filter((t) => t.id !== taskItem.id))
    }

    if (toStatus === "todo") {
      setTodoTasks((prev) => [...prev, updated])
    }

    if (toStatus === "doing") {
      setDoingTasks((prev) => [...prev, updated])
    }

    if (toStatus === "done") {
      setDoneTasks((prev) => [...prev, updated])
    }
  }

  const startTask = (taskItem: Task) => {
    moveTask(taskItem, "todo", "doing")
  }

  const completeTask = (taskItem: Task) => {
    moveTask(taskItem, "doing", "done")
  }

  // =========================================================
  // logic: 削除
  // =========================================================
  const deleteTask = (id: number, status: TaskStatus) => {
    const ok = window.confirm("このタスクを削除しますか？")
    if (!ok) return

    if (status === "todo") {
      setTodoTasks((prev) => prev.filter((t) => t.id !== id))
    }

    if (status === "doing") {
      setDoingTasks((prev) => prev.filter((t) => t.id !== id))
    }

    if (status === "done") {
      setDoneTasks((prev) => prev.filter((t) => t.id !== id))
    }
  }

  // =========================================================
  // logic: 編集開始
  // =========================================================
  const startEdit = (taskItem: Task, status: TaskStatus) => {
    setEditingTask({
      task: taskItem,
      status,
    })

    setEditTitle(taskItem.title)
    setEditDescription(taskItem.description)
    setEditDueDate(taskItem.dueDate)
    setEditPriority(taskItem.priority)
  }

  // =========================================================
  // logic: 編集キャンセル
  // =========================================================
  const cancelEdit = () => {
    setEditingTask(null)
    setEditTitle("")
    setEditDescription("")
    setEditDueDate("")
    setEditPriority("中")
  }

  // =========================================================
  // logic: 編集保存
  // =========================================================
  const saveEdit = () => {
    if (!editingTask) return

    if (!editTitle.trim()) {
      alert("タイトルを入力してください。")
      return
    }

    const updatedTask: Task = {
      ...editingTask.task,
      title: editTitle.trim(),
      description: editDescription.trim(),
      dueDate: editDueDate,
      priority: editPriority,
      updatedAt: new Date().toISOString(),
    }

    const updateList = (tasks: Task[]) => {
      return tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    }

    if (editingTask.status === "todo") {
      setTodoTasks((prev) => updateList(prev))
    }

    if (editingTask.status === "doing") {
      setDoingTasks((prev) => updateList(prev))
    }

    if (editingTask.status === "done") {
      setDoneTasks((prev) => updateList(prev))
    }

    cancelEdit()
  }

  // =========================================================
  // helper: CSVエスケープ
  // =========================================================
  // FIX: カンマ・改行・ダブルクォートでCSVが壊れる問題を防ぐ
  const escapeCSV = (value: string | number) => {
    const text = String(value ?? "")
    const escaped = text.replace(/"/g, '""')

    return `"${escaped}"`
  }

  // =========================================================
  // logic: CSV出力
  // =========================================================
  const exportCSV = () => {
    const all = getAllTasksWithStatus()
    const text = searchText.toLowerCase().trim()

    const filtered = text
      ? all.filter((item) => {
          return (
            item.title.toLowerCase().includes(text) ||
            item.description.toLowerCase().includes(text)
          )
        })
      : all

    const header = [
      "id",
      "title",
      "description",
      "dueDate",
      "priority",
      "status",
      "createdAt",
      "updatedAt",
    ]

    const rows = filtered.map((t) => [
      t.id,
      t.title,
      t.description,
      t.dueDate,
      t.priority,
      t.status,
      t.createdAt,
      t.updatedAt,
    ])

    const csvContent = [
      header.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n")

    // FIX: BOMを付けてExcelの日本語文字化けを減らす
    const bom = "\uFEFF"

    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "tasks.csv"
    a.click()

    URL.revokeObjectURL(url)
  }

  // =========================================================
  // logic: Googleカレンダー共有
  // =========================================================
  // NOTE: Google APIの直接登録ではなく、Googleカレンダー作成画面を開く安全な方式
  const shareToGoogleCalendar = (taskItem: Task) => {
    if (!taskItem.dueDate) {
      alert("Googleカレンダーに共有するには期限日を設定してください。")
      return
    }

    const date = taskItem.dueDate.replaceAll("-", "")

    const title = encodeURIComponent(taskItem.title)
    const details = encodeURIComponent(
      [
        taskItem.description,
        "",
        `優先度: ${taskItem.priority}`,
        `作成日: ${formatDateTime(taskItem.createdAt)}`,
        `更新日: ${formatDateTime(taskItem.updatedAt)}`,
      ].join("\n")
    )

    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${title}` +
      `&dates=${date}/${date}` +
      `&details=${details}`

    window.open(url, "_blank")
  }

  // =========================================================
  // logic: drag and drop
  // =========================================================
  const handleDrop = (toStatus: TaskStatus) => {
    if (!draggingTask) return

    moveTask(draggingTask.task, draggingTask.status, toStatus)
    setDraggingTask(null)
  }

  // =========================================================
  // persistence: localStorage読み込み
  // =========================================================
  useEffect(() => {
    setTodoTasks(loadTasks("todoTasks"))
    setDoingTasks(loadTasks("doingTasks"))
    setDoneTasks(loadTasks("doneTasks"))
    setMounted(true)
  }, [])

  // =========================================================
  // persistence: localStorage保存
  // =========================================================
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem("todoTasks", JSON.stringify(todoTasks))
    localStorage.setItem("doingTasks", JSON.stringify(doingTasks))
    localStorage.setItem("doneTasks", JSON.stringify(doneTasks))
  }, [mounted, todoTasks, doingTasks, doneTasks])

  // =========================================================
  // responsive: 画面幅の監視
  // =========================================================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()

    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // =========================================================
  // ui: task card
  // =========================================================
  const renderTaskCard = (item: Task, status: TaskStatus) => {
    const isEditing = editingTask?.task.id === item.id

    return (
      <div
        key={item.id}
        draggable={!isEditing}
        onDragStart={() => setDraggingTask({ task: item, status })}
        style={{
          border: `1px solid ${palette.border}`,
          borderRadius: 16,
          padding: 16,
          marginBottom: 14,
          background: palette.white,
          color: palette.text,
          cursor: isEditing ? "default" : "grab",
          boxShadow: "0 3px 10px rgba(120, 110, 100, 0.08)",
          boxSizing: "border-box",
        }}
      >
        {isEditing ? (
          <>
            <input
              placeholder="タイトル"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: 8,
              }}
            />

            <input
              placeholder="詳細"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: 8,
              }}
            />

            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: 8,
              }}
            />

            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: 8,
              }}
            >
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>

            <button style={saveButtonStyle} onClick={saveEdit}>
              保存
            </button>

            <button style={cancelButtonStyle} onClick={cancelEdit}>
              キャンセル
            </button>
          </>
        ) : (
          <>
            <h3
              style={{
                marginTop: 0,
                marginBottom: 8,
                color: palette.text,
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                marginTop: 0,
                marginBottom: 8,
                color: palette.text,
                whiteSpace: "pre-wrap",
              }}
            >
              {item.description || "詳細なし"}
            </p>

            <p style={{ margin: "4px 0", color: palette.subText }}>
              期限: {item.dueDate || "未設定"}
            </p>

            <p style={{ margin: "4px 0 12px", color: palette.subText }}>
              優先度: {item.priority}
            </p>

            <div style={{ marginBottom: 10 }}>
              {status === "todo" && (
                <button style={startButtonStyle} onClick={() => startTask(item)}>
                  開始
                </button>
              )}

              {status === "doing" && (
                <button
                  style={startButtonStyle}
                  onClick={() => completeTask(item)}
                >
                  完了
                </button>
              )}

              <button
                style={editButtonStyle}
                onClick={() => startEdit(item, status)}
              >
                編集
              </button>

              <button
                style={deleteButtonStyle}
                onClick={() => deleteTask(item.id, status)}
              >
                削除
              </button>

              <button
                style={calendarButtonStyle}
                onClick={() => shareToGoogleCalendar(item)}
              >
                Googleカレンダー
              </button>
            </div>

            <small
              style={{
                display: "block",
                color: palette.subText,
                marginTop: 4,
              }}
            >
              作成日: {formatDateTime(item.createdAt)}
            </small>

            <small
              style={{
                display: "block",
                color: palette.subText,
                marginTop: 2,
              }}
            >
              更新: {formatDateTime(item.updatedAt)}
            </small>
          </>
        )}
      </div>
    )
  }

  // =========================================================
  // ui: column
  // =========================================================
  const renderColumn = (title: string, status: TaskStatus, tasks: Task[]) => {
    const filteredTasks = filterTasks(tasks)

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(status)}
        style={{
          flex: 1,
          minWidth: isMobile ? "100%" : 280,
          minHeight: 320,
          padding: 16,
          borderRadius: 18,
          color: palette.text,
          boxSizing: "border-box",
          ...getColumnStyle(status),
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 14,
            color: palette.text,
          }}
        >
          {title}{" "}
          <span
            style={{
              fontSize: 14,
              color: palette.subText,
            }}
          >
            ({filteredTasks.length})
          </span>
        </h2>

        {filteredTasks.length === 0 ? (
          <p
            style={{
              color: palette.subText,
              fontSize: 14,
            }}
          >
            タスクはありません
          </p>
        ) : (
          filteredTasks.map((item) => renderTaskCard(item, status))
        )}
      </div>
    )
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div
      style={{
        padding: isMobile ? 14 : 20,
        fontFamily: "sans-serif",
        background: palette.bg,
        color: palette.text,
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          marginTop: 0,
          marginBottom: 18,
          color: palette.text,
        }}
      >
        タスク管理アプリ
      </h1>

      {/* =========================
          search + CSV
      ========================= */}
      <div
        style={{
          marginBottom: 18,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 10,
          alignItems: isMobile ? "stretch" : "center",
        }}
      >
        <input
          placeholder="検索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            ...inputStyle,
            width: isMobile ? "100%" : 260,
          }}
        />

        <button
          style={{
            ...csvButtonStyle,
            width: isMobile ? "100%" : "auto",
          }}
          onClick={exportCSV}
        >
          CSV出力（検索結果）
        </button>
      </div>

      {/* =========================
          input form
      ========================= */}
      <div
        style={{
          marginBottom: 22,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 10,
          alignItems: isMobile ? "stretch" : "center",
        }}
      >
        <input
          placeholder="タイトル"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={{
            ...inputStyle,
            width: isMobile ? "100%" : 220,
          }}
        />

        <input
          placeholder="詳細"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            ...inputStyle,
            width: isMobile ? "100%" : 280,
          }}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            ...inputStyle,
            width: isMobile ? "100%" : "auto",
          }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          style={{
            ...inputStyle,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>

        <button
          style={{
            ...addButtonStyle,
            width: isMobile ? "100%" : "auto",
          }}
          onClick={addTask}
        >
          追加
        </button>
      </div>

      {/* =========================
          task columns
      ========================= */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 18,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {renderColumn("やること", "todo", todoTasks)}
        {renderColumn("進行中", "doing", doingTasks)}
        {renderColumn("完了", "done", doneTasks)}
      </div>
    </div>
  )
}