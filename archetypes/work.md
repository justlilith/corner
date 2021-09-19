---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: false
index: {{delimit (split .Name "-" | first 1) ""}}
outputs: work
---

# {{ replace .Name "-" " " | title }}

Content

- List
- List 2