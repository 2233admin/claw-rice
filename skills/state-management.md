# State Management

OMC 三层持久化机制，全部存储在 worktree 根目录下。

## Notepad (.omc/notepad.md)

持久化草稿板，三个分区：

| 分区 | 保留策略 | 用途 |
|------|----------|------|
| Priority | 永久（≤500 chars） | 关键上下文，每次对话都加载 |
| Working | 7 天 TTL | 当前任务上下文 |
| Manual | 永久 | 用户手动管理的笔记 |

工具: `notepad_read`, `notepad_write_priority`, `notepad_write_working`, `notepad_write_manual`, `notepad_prune`, `notepad_stats`

## Project Memory (.omc/project-memory.json)

结构化项目知识库：
- **tech_stack**: 语言、框架、运行时
- **build_commands**: 构建/测试/lint 命令
- **conventions**: 命名规范、文件结构、模式
- **directives**: 项目专属规则

工具: `project_memory_read`, `project_memory_write`, `project_memory_add_note`, `project_memory_add_directive`

## Mode State (.omc/state/)

追踪活跃执行模式（ralph、team、autopilot）的 JSON 状态文件。

- 路径: `.omc/state/{mode}-state.json`
- 会话隔离: `.omc/state/sessions/{sessionId}/`

工具: `state_read`, `state_write`, `state_clear`, `state_list_active`, `state_get_status`
