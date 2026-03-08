# Team Pipeline

多 Agent 协作编排，处理复杂任务的默认流水线。

## 流水线阶段

```
team-plan → team-prd → team-exec → team-verify → team-fix (loop)
```

### 阶段路由

| 阶段 | Agent | 用途 |
|------|-------|------|
| `team-plan` | explore + planner，可选 analyst/architect | 需求分析 + 任务拆解 |
| `team-prd` | analyst，可选 critic | 产品需求 + 验收标准 |
| `team-exec` | executor + 专家（designer、build-fixer、writer、test-engineer、deep-executor）| 实现 |
| `team-verify` | verifier + 评审按需 | 完成证据 + 主张验证 |
| `team-fix` | executor/build-fixer/debugger（按缺陷类型） | 修复循环（有最大次数上限） |

### 终止状态
- `complete` — 所有验证通过
- `failed` — 超出最大修复次数
- `cancelled` — 用户中断

## 使用方式

```bash
# 启动 3 个 executor 协作
/team 3:executor "implement feature X"

# team ralph 持久执行模式
/team ralph "build the entire module"
```

## 模型路由

| Agent 类型 | 模型 | 场景 |
|------------|------|------|
| explore | haiku | 快速代码库探索 |
| executor | sonnet | 标准实现 |
| deep-executor | opus | 复杂自主任务 |
| architect | opus | 系统设计决策 |
| verifier | sonnet/opus | 完成验证 |

## 激活关键词
"team", "coordinated team", "team ralph"
