# Ralph Mode

自引用执行循环，带验证器确认。持续工作直到 verifier 确认完成。

## 激活方式
- 关键词: "ralph", "don't stop", "must complete"
- 命令: `/oh-my-claudecode:ralph`

## 执行流程

```
Execute → Verify → Fix (loop) → Complete
              ↓ fail
         Retry with different approach
```

## 包含模式
- **ultrawork**: 最大并行度，多 Agent 同时编排
- **ultraqa**: QA 循环 — 测试、验证、修复、重复

## 取消
- `/oh-my-claudecode:cancel` 终止执行
- `--force` 清除所有状态

## 注意
ralph 绑定 team 模式时（`team ralph`），取消任意一个会同时取消另一个。
