import type { Meta, StoryObj } from '@storybook/react'
import { useForm, FormProvider } from 'react-hook-form'
import { DurationInput } from '../DurationInput'

// Type for our form values
type FormValues = {
  duration: string
  timeout?: string
}

// Wrapper component that provides form context and handles submission
const FormWrapper = ({
  children,
  defaultValues = { duration: 'PT1H' }
}: {
  children: React.ReactNode
  defaultValues?: Record<string, string>
}) => {
  const methods = useForm<FormValues>({ defaultValues })

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
type Story = StoryObj<typeof meta>


const meta: Meta<typeof DurationInput> = {
  title: 'Admin/DurationInput',
  component: DurationInput,
  tags: ['autodocs'],
  decorators: [
    (Story, { args }) => (
      <FormWrapper defaultValues={{ [args.source as string]: args.defaultValue || 'PT1H' }}>
        <Story />
      </FormWrapper>
    ),
  ],
  argTypes: {
    source: { control: 'text' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    disabled: { control: 'boolean' },
    isRequired: { control: 'boolean' },
  },
  args: {
    source: 'duration',
    label: 'Duration',
  },
}

export default meta

// Stories
export const Default: Story = {}

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'PT30M',
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
    disabled: true,
    defaultValue: 'PT1H',
  },
}

export const WithError: Story = {
  decorators: [
    (Story, { args }) => {
      const methods = useForm({
        defaultValues: { [args.source as string]: args.defaultValue || 'PT1H' },
      })
      
      // Set error state
      methods.setError(args.source as string, {
        type: 'validate',
        message: 'Duration must be at least 1 minute',
      })

      return (
        <FormProvider {...methods}>
          <div style={{ padding: '20px', maxWidth: '400px' }}>
            <Story />
          </div>
        </FormProvider>
      )
    },
  ],
  args: {
    label: 'Duration with Error',
  },
}

export const HoursUnit: Story = {
  args: {
    defaultValue: 'PT2H', // 2 hours
    label: 'Duration in Hours',
  },
}

export const DaysUnit: Story = {
  args: {
    defaultValue: 'P1D', // 1 day
  },
}
