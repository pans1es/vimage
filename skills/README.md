# vimage skills

vimage publishes three public Agent skills for lightweight installation:

```bash
npx skills add vimage/skills
```

This directory is the source of truth for `setup-vimage-skills` and `video-workflow`, and is licensed under the [MIT License](LICENSE). The third, `adapt-custom-endpoint`, is also used by vimage's embedded Agent, so its source lives in `agent_runtime_profile/.claude/skills/adapt-custom-endpoint/` and the mirror workflow copies it into the distribution repository from there — it is deliberately not duplicated here.
