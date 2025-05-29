import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { ControllerFieldState } from 'react-hook-form'
import { DurationInput } from '../DurationInput'

// Mock the useInput hook with proper TypeScript types
const mockUseInput = jest.fn()

interface UseInputProps {
  defaultValue?: string
  field?: Record<string, unknown>
  fieldState?: Partial<ControllerFieldState>
}

// Mock the module with proper types
jest.mock('react-admin', () => {
  const originalModule = jest.requireActual('react-admin')
  
  return {
    ...originalModule,
    useInput: ({ defaultValue, field = {}, fieldState = {} }: UseInputProps = {}) => {
      const [value, setValue] = React.useState<string>(defaultValue || '')
      
      return {
        field: {
          value,
          onChange: (newValue: string) => setValue(newValue),
          ...field
        },
        fieldState: { error: null, ...fieldState }
      }
    },
    Form: ({ children }: { children: React.ReactNode }) => (
      <form>{children}</form>
    )
  }
})

// Reset mock before each story
beforeEach(() => {
  mockUseInput.mockClear()
})

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks()
})

const meta: Meta<typeof DurationInput> = {
  title: 'Admin/DurationInput',
  component: DurationInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    source: { control: 'text' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    isRequired: { control: 'boolean' },
  },
  args: {
    source: 'duration',
    label: 'Duration',
    helperText: 'Enter the duration',
    isRequired: false,
  },
}

export default meta
type Story = StoryObj<typeof DurationInput>

export const Default: Story = {
  args: {
    source: 'duration',
    label: 'Duration',
  },
}

export const WithDefaultValue: Story = {
  args: {
    source: 'duration',
    label: 'Duration',
    defaultValue: 'PT30M',
  },
}

export const WithError: Story = {
  args: {
    source: 'duration',
    label: 'Duration',
    fieldState: { 
      error: { 
        type: 'validate',
        message: 'Duration must be at least 1 minute' 
      },
      invalid: true,
      isTouched: true,
      isDirty: false,
      isValidating: false
    },
  },
}

export const WithHelperText: Story = {
  args: {
    source: 'timeout',
    label: 'Session Timeout',
    helperText: 'How long should this session last?',
  },
}

export const Disabled: Story = {
  args: {
    source: 'duration',
    label: 'Duration',
    disabled: true,
    defaultValue: 'PT1H',
  },
}

export const HoursUnit: Story = {
  args: {
    defaultValue: 'PT2H', // 2 hours
  },
}

export const DaysUnit: Story = {
  args: {
    defaultValue: 'P1D', // 1 day
  },
}
