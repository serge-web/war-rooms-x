import type { Meta, StoryObj } from '@storybook/react'
import { useForm, FormProvider } from 'react-hook-form'
import { DurationInput } from '../DurationInput'

// Type for our form values
type FormValues = {
  duration: string
  timeout?: string
  // Add other fields as needed
}

// Wrapper component that provides form context and handles submission
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      duration: 'PT1H', // Default value for the duration field
    },
  })

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          {children}
          <button 
            type="submit" 
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Submit
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

// Define the story meta
type Story = StoryObj<typeof DurationInput>

const meta: Meta<typeof DurationInput> = {
  title: 'Admin/DurationInput',
  component: DurationInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <FormWrapper>
        <Story />
      </FormWrapper>
    ),
  ],
}

export default meta

// Stories
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
