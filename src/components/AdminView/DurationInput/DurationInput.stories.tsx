import type { Meta, StoryObj } from '@storybook/react'
import { Form } from 'react-admin'
import { DurationInput } from '../DurationInput'

const meta: Meta<typeof DurationInput> = {
  title: 'Admin/DurationInput',
  component: DurationInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Form>
        <Story />
      </Form>
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

export const Default: Story = {}

export const WithInitialValue: Story = {
  args: {
    defaultValue: 'PT30M', // 30 minutes
  },
}

export const Required: Story = {
  args: {
    isRequired: true,
    helperText: 'This field is required',
  },
}

export const CustomLabel: Story = {
  args: {
    label: 'Session Duration',
    helperText: 'How long should this session last?',
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
