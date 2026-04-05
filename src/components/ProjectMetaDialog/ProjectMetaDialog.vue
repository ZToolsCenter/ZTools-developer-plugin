<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { ProjectMetaDialogProps, ProjectMetaDialogEmits, ProjectTemplate } from './ProjectMetaDialog'

const props = withDefaults(defineProps<ProjectMetaDialogProps>(), {
  title: '新建项目',
  confirmText: '确定',
  loading: false,
  nameReadonly: false,
  showScaffold: false,
})
const emit = defineEmits<ProjectMetaDialogEmits>()

const localForm = reactive({
  name: '',
  title: '',
  description: '',
  platform: [] as string[],
  author: '',
})

const selectedTemplate = ref<ProjectTemplate>('vue-vite')
const projectPath = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    localForm.name = props.form.name
    localForm.title = props.form.title
    localForm.description = props.form.description
    localForm.platform = [...props.form.platform]
    localForm.author = props.form.author
    if (props.showScaffold) {
      selectedTemplate.value = 'vue-vite'
      projectPath.value = ''
    }
  }
})

const handleClose = (): void => {
  emit('update:visible', false)
}

const NAME_PATTERN = /^[a-z0-9-]+$/
const isNameValid = computed(() => {
  if (props.nameReadonly) return true
  const name = localForm.name.trim()
  return name.length > 0 && NAME_PATTERN.test(name)
})

const canConfirm = computed(() => {
  if (!isNameValid.value || !localForm.title.trim()) return false
  if (props.showScaffold && !projectPath.value) return false
  return true
})

const handleSelectPath = (): void => {
  // @ts-ignore — window.ztools 由宿主在运行时注入
  const result = window.ztools?.showOpenDialog({
    title: '选择项目存放目录',
    buttonLabel: '选择',
    properties: ['openDirectory', 'createDirectory'],
  })
  if (result?.[0]) {
    projectPath.value = result[0]
  }
}

const handleConfirm = (): void => {
  emit('confirm', {
    name: localForm.name.trim(),
    title: localForm.title.trim(),
    description: localForm.description.trim(),
    platform: [...localForm.platform],
    author: localForm.author.trim(),
    ...(props.showScaffold ? {
      template: selectedTemplate.value,
      projectPath: projectPath.value,
    } : {}),
  })
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    fullscreen
    class="meta-dialog--fullscreen"
    :close-on-click-modal="false"
    :close-on-press-escape="!loading"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form label-position="top" size="default">
      <template v-if="showScaffold">
        <el-form-item label="项目模板" required>
          <el-radio-group v-model="selectedTemplate">
            <el-radio value="vue-vite">Vue + Vite</el-radio>
            <el-radio value="react-vite">React + Vite</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="项目位置" required>
          <div class="meta-dialog__path-row">
            <el-input
              :model-value="projectPath"
              readonly
              placeholder="选择项目存放目录"
            />
            <el-button @click="handleSelectPath">选择</el-button>
          </div>
        </el-form-item>
      </template>
      <el-form-item label="应用ID" :required="!nameReadonly">
        <el-input
          v-model="localForm.name"
          :readonly="nameReadonly"
          placeholder="仅小写字母、数字和中划线"
          maxlength="100"
        />
        <div v-if="!nameReadonly && localForm.name.trim() && !isNameValid" class="el-form-item__error">
          仅允许小写字母、数字和中划线
        </div>
      </el-form-item>
      <el-form-item label="插件标题" required>
        <el-input
          v-model="localForm.title"
          placeholder="输入插件名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="插件描述">
        <el-input
          v-model="localForm.description"
          type="textarea"
          :rows="2"
          placeholder="简要描述插件功能（可选）"
          maxlength="200"
        />
      </el-form-item>
      <el-form-item label="开发者">
        <el-input
          v-model="localForm.author"
          placeholder="输入开发者名称（可选）"
          maxlength="50"
        />
      </el-form-item>
      <el-form-item label="运行平台">
        <el-checkbox-group v-model="localForm.platform">
          <el-checkbox value="darwin">macOS</el-checkbox>
          <el-checkbox value="win32">Windows</el-checkbox>
          <el-checkbox value="linux">Linux</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="loading" @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!canConfirm"
        @click="handleConfirm"
      >{{ confirmText }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.meta-dialog__path-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
</style>

<style>
.meta-dialog--fullscreen .el-dialog__body {
  max-width: 80%;
  margin: 0 auto;
}
</style>
